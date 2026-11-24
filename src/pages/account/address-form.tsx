import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { SearchSelect } from '../../components/SearchSelect.tsx'
import { useCopy } from '../../i18n/index.ts'
import { addressRequest, missingAddress, type Address } from '../../profile/address.ts'
import { areas, childPlaces, chinaName, placeOptions } from '../../profile/place.ts'

const blank = {
  receiver_name: '',
  phone: '',
  country: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  postal_code: '',
  is_default: false,
}

const fieldClass =
  'mt-2 h-[52px] w-full rounded-lg border border-[#ddded4] bg-transparent px-4 text-base outline-none'

export function AddressFormPage() {
  const copy = useCopy()
  const { addressId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const creating = addressId === undefined
  const valid = creating || (/^\d+$/.test(addressId) && BigInt(addressId) > 0n)
  const emptyList = Boolean((location.state as { empty?: boolean } | null)?.empty)
  const [draft, setDraft] = useState({ ...blank, country: chinaName })
  const [loading, setLoading] = useState(!creating && valid)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (creating || !valid) return
    let gone = false
    void request<Address>(`/v1/users/me/addresses/${addressId}`, { auth: true })
      .then((row) => {
        if (gone || !row) return
        setDraft({
          receiver_name: row.receiver_name,
          phone: row.phone,
          country: chinaName,
          province: row.province,
          city: row.city,
          district: row.district,
          detail_address: row.detail_address,
          postal_code: row.postal_code,
          is_default: row.is_default,
        })
      })
      .catch((err: unknown) => {
        if (gone) return
        if (missingAddress(err)) {
          navigate('/profile/addresses', { replace: true })
          return
        }
        setLoadError(getErrorMessage(err))
      })
      .finally(() => {
        if (!gone) setLoading(false)
      })
    return () => {
      gone = true
    }
  }, [addressId, creating, navigate, valid])

  const provinces = childPlaces(areas, '86')
  const provinceCode = provinces.find((place) => place.name === draft.province)?.code ?? ''
  const cities = provinceCode ? childPlaces(areas, provinceCode) : []
  const onlyUrban = cities.length === 1 && cities[0]?.name === '市辖区'
  const cityCode = onlyUrban
    ? (cities[0]?.code ?? '')
    : (cities.find((place) => place.name === draft.city)?.code ?? '')
  const rawDistricts = cityCode ? childPlaces(areas, cityCode) : []
  const districts = rawDistricts.some((place) => place.name !== '市辖区')
    ? rawDistricts.filter((place) => place.name !== '市辖区')
    : rawDistricts
  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:px-14">
      <Link to="/profile/addresses" className="text-sm font-semibold underline underline-offset-4">
        {copy.address.back}
      </Link>
      <h1 className="mt-6 text-4xl font-bold">{creating ? copy.address.newTitle : copy.address.editTitle}</h1>
      {!valid ? <p className="mt-6 text-sm text-[#9b2c2c]">{copy.common.paramError}</p> : null}
      {loading ? <p className="mt-6 text-sm text-[#696b61]">{copy.common.loading}</p> : null}
      {loadError ? <p className="mt-6 text-sm text-[#9b2c2c]">{loadError}</p> : null}
      {valid && !loading && !loadError ? (
        <form
          className="mt-8"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (saving) return
            const receiver = draft.receiver_name.trim()
            const phone = draft.phone.trim()
            const detail = draft.detail_address.trim()
            if (!receiver || receiver.length > 50) {
              setFormError(receiver ? copy.address.receiverMax : copy.address.receiverRequired)
              return
            }
            if (phone.length > 20 || !/^\+?[0-9]{6,20}$/.test(phone)) {
              setFormError(copy.address.phone)
              return
            }
            if (
              [draft.province, draft.city, draft.district].some((part) => part.trim().length > 50)
            ) {
              setFormError(copy.address.regionMax)
              return
            }
            if (!detail || detail.length > 255) {
              setFormError(detail ? copy.address.detailMax : copy.address.detailRequired)
              return
            }
            if (draft.postal_code.trim().length > 20) {
              setFormError(copy.address.postalMax)
              return
            }
            const body = {
              receiver_name: receiver,
              phone,
              country: chinaName,
              province: draft.province.trim(),
              city: onlyUrban ? '市辖区' : draft.city.trim(),
              district: draft.district.trim(),
              detail_address: detail,
              postal_code: draft.postal_code.trim(),
              is_default: draft.is_default,
            }
            setFormError(null)
            setNotice(null)
            setSaving(true)
            const path = creating ? '/v1/users/me/addresses' : `/v1/users/me/addresses/${addressId}`
            void addressRequest<Address>(path, {
              method: creating ? 'POST' : 'PUT',
              body: JSON.stringify(body),
            })
              .then((saved) => {
                if (saved && saved.is_default !== body.is_default) {
                  setDraft((current) => ({ ...current, is_default: saved.is_default }))
                  setNotice(saved.is_default ? copy.address.stillDefault : copy.address.defaultUpdated)
                  return
                }
                navigate('/profile/addresses')
              })
              .catch((err: unknown) => {
                if (missingAddress(err)) {
                  navigate('/profile/addresses', { replace: true })
                  return
                }
                setFormError(getErrorMessage(err))
              })
              .finally(() => {
                setSaving(false)
              })
          }}
        >
          {creating && emptyList ? (
            <p className="text-sm text-[#696b61]">{copy.address.willDefault}</p>
          ) : null}
          {formError ? <p className="mt-4 text-sm text-[#9b2c2c]">{formError}</p> : null}
          {notice ? <p className="mt-4 text-sm text-[#191919]">{notice}</p> : null}
          <label className="mt-6 block text-xs font-semibold">
            {copy.address.receiver}
            <input
              className={fieldClass}
              maxLength={50}
              value={draft.receiver_name}
              onChange={(event) => setDraft({ ...draft, receiver_name: event.target.value })}
            />
          </label>
          <label className="mt-5 block text-xs font-semibold">
            {copy.address.phoneLabel}
            <input
              className={fieldClass}
              maxLength={20}
              value={draft.phone}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
            />
          </label>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-xs font-semibold">
              {copy.address.province}
              <SearchSelect
                value={draft.province}
                options={placeOptions(provinces, draft.province)}
                placeholder={copy.address.searchProvince}
                onChange={(name) => {
                  const code = provinces.find((place) => place.name === name)?.code ?? ''
                  const nextCities = code ? childPlaces(areas, code) : []
                  const urban = nextCities.length === 1 && nextCities[0]?.name === '市辖区'
                  setDraft({
                    ...draft,
                    province: name,
                    city: urban ? nextCities[0].name : '',
                    district: '',
                  })
                }}
              />
            </label>
            {onlyUrban ? null : (
              <label className="block text-xs font-semibold">
                {copy.address.city}
                <SearchSelect
                  value={draft.city}
                  options={placeOptions(cities, draft.city)}
                  placeholder={copy.address.searchCity}
                  disabled={provinceCode === ''}
                  onChange={(name) => setDraft({ ...draft, city: name, district: '' })}
                />
              </label>
            )}
            <label className="block text-xs font-semibold">
              {copy.address.district}
              <SearchSelect
                value={draft.district}
                options={placeOptions(districts, draft.district)}
                placeholder={copy.address.searchDistrict}
                disabled={cityCode === ''}
                onChange={(name) => setDraft({ ...draft, district: name })}
              />
            </label>
          </div>
          <label className="mt-5 block text-xs font-semibold">
            {copy.address.detail}
            <input
              className={fieldClass}
              maxLength={255}
              value={draft.detail_address}
              onChange={(event) => setDraft({ ...draft, detail_address: event.target.value })}
            />
          </label>
          <label className="mt-5 block text-xs font-semibold">
            {copy.address.postal}
            <input
              className={fieldClass}
              maxLength={20}
              value={draft.postal_code}
              onChange={(event) => setDraft({ ...draft, postal_code: event.target.value })}
            />
          </label>
          <label className="mt-5 flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.is_default}
              onChange={(event) => setDraft({ ...draft, is_default: event.target.checked })}
            />
            {copy.address.defaultLabel}
          </label>
          <button
            type="submit"
            disabled={saving}
            className="mt-6 h-[52px] w-full rounded-lg bg-[#191919] text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
          >
            {saving ? copy.common.saving : copy.common.save}
          </button>
        </form>
      ) : null}
    </div>
  )
}
