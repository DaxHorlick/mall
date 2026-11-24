import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, request } from '../../api/client.ts'
import { useCopy } from '../../i18n/index.ts'
import { addressRequest, missingAddress, type Address } from '../../profile/address.ts'

export function AddressesPage() {
  const copy = useCopy()
  const [list, setList] = useState<Address[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let gone = false
    void request<Address[] | null>('/v1/users/me/addresses', { auth: true })
      .then((rows) => {
        if (!gone) setList(Array.isArray(rows) ? rows : [])
      })
      .catch((err: unknown) => {
        if (!gone) setLoadError(getErrorMessage(err))
      })
      .finally(() => {
        if (!gone) setLoading(false)
      })
    return () => {
      gone = true
    }
  }, [attempt])

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-14">
      <h1 className="text-4xl font-bold">{copy.address.title}</h1>
      <Link
        to="/profile/addresses/new"
        state={{ empty: list?.length === 0 }}
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-[#191919] px-4 text-sm font-semibold text-[#f7f6f0]"
      >
        {copy.address.new}
      </Link>
      {loading && !list ? <p className="mt-6 text-sm text-[#696b61]">{copy.common.loading}</p> : null}
      {loadError ? (
        <div className="mt-6">
          <p className="text-sm text-[#9b2c2c]">{loadError}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold underline underline-offset-4"
            onClick={() => {
              setLoading(true)
              setLoadError(null)
              setAttempt((current) => current + 1)
            }}
          >
            {copy.common.tryAgain}
          </button>
        </div>
      ) : null}
      {actionError ? <p className="mt-4 text-sm text-[#9b2c2c]">{actionError}</p> : null}
      {list && list.length === 0 && !loadError ? (
        <p className="mt-8 text-sm text-[#696b61]">{copy.address.empty}</p>
      ) : null}
      <ul className="mt-8">
        {(list ?? []).map((address) => {
          const id = String(address.address_id)
          const place = [
            address.country,
            address.province,
            address.city,
            address.district,
            address.detail_address,
          ]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(' ')
          const confirming = confirmId === id
          return (
            <li key={id} className="flex flex-col gap-3 border-b border-[#ddded4] py-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {address.receiver_name}
                  <span className="ml-3 font-normal text-[#696b61]">{address.phone}</span>
                </p>
                <p className="mt-1 text-sm text-[#696b61]">{place}</p>
                {address.postal_code ? (
                  <p className="mt-1 text-sm text-[#696b61]">{address.postal_code}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span
                  className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold ${
                    address.is_default ? 'bg-[#d7fa55]' : 'border border-[#ddded4]'
                  }`}
                >
                  {address.is_default ? (
                    copy.address.default
                  ) : (
                    <button
                      type="button"
                      disabled={busyId !== null}
                      className="disabled:opacity-60"
                      onClick={() => {
                        setActionError(null)
                        setConfirmId(null)
                        setBusyId(id)
                        void addressRequest<Address>(`/v1/users/me/addresses/${id}/default`, { method: 'PUT' })
                          .then(() => {
                            setLoading(true)
                            setAttempt((current) => current + 1)
                          })
                          .catch((err: unknown) => {
                            setActionError(getErrorMessage(err))
                            if (missingAddress(err)) {
                              setLoading(true)
                              setAttempt((current) => current + 1)
                            }
                          })
                          .finally(() => {
                            setBusyId(null)
                          })
                      }}
                    >
                      {copy.address.setDefault}
                    </button>
                  )}
                </span>
                <Link
                  to={`/profile/addresses/${id}`}
                  className={`inline-flex h-10 items-center rounded-lg border border-[#ddded4] px-3 text-sm font-semibold ${
                    busyId !== null ? 'pointer-events-none opacity-60' : ''
                  }`}
                >
                  {copy.common.edit}
                </Link>
                {confirming ? (
                  <button
                    type="button"
                    disabled={busyId !== null}
                    className="h-10 rounded-lg bg-[#191919] px-3 text-sm font-semibold text-[#f7f6f0] disabled:opacity-60"
                    onClick={() => {
                      setActionError(null)
                      setBusyId(id)
                      void addressRequest<unknown>(`/v1/users/me/addresses/${id}`, { method: 'DELETE' })
                        .then(() => {
                          setConfirmId(null)
                          setLoading(true)
                          setAttempt((current) => current + 1)
                        })
                        .catch((err: unknown) => {
                          setActionError(getErrorMessage(err))
                          if (missingAddress(err)) {
                            setConfirmId(null)
                            setLoading(true)
                            setAttempt((current) => current + 1)
                          }
                        })
                        .finally(() => {
                          setBusyId(null)
                        })
                    }}
                  >
                    {busyId === id ? copy.address.deleting : copy.address.confirm}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId !== null}
                    className="h-10 rounded-lg border border-[#ddded4] px-3 text-sm font-semibold disabled:opacity-60"
                    onClick={() => setConfirmId(id)}
                  >
                    {copy.address.delete}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
