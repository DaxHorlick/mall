import type { GarmentSide } from './types.ts'

/** 按款式画平面衣服，领口挖空。圆领卫衣和 T 恤都走圆领。 */
export function drawGarment(
  context: CanvasRenderingContext2D,
  style: string,
  side: GarmentSide,
  color: string,
) {
  context.beginPath()

  if (style === 'hoodie') {
    context.moveTo(side === 'back' ? 220 : 250, 230)
    context.bezierCurveTo(210, side === 'back' ? 20 : 70, 590, side === 'back' ? 20 : 70, side === 'back' ? 580 : 550, 230)
    context.lineTo(640, 250)
    context.lineTo(770, 480)
    context.lineTo(700, 560)
    context.lineTo(600, 400)
    context.lineTo(585, 900)
    context.lineTo(215, 900)
    context.lineTo(200, 400)
    context.lineTo(100, 560)
    context.lineTo(30, 480)
    context.lineTo(160, 250)
  } else if (style === 'tank') {
    context.moveTo(320, 170)
    context.bezierCurveTo(350, 230, 450, 230, 480, 170)
    context.lineTo(545, 255)
    context.lineTo(500, 430)
    context.lineTo(545, 890)
    context.lineTo(255, 890)
    context.lineTo(300, 430)
    context.lineTo(255, 255)
  } else {
    context.moveTo(250, 188)
    context.bezierCurveTo(310, 255, 490, 255, 550, 188)
    context.lineTo(640, 214)
    context.lineTo(760, 268)
    context.lineTo(730, 418)
    context.lineTo(600, 372)
    context.lineTo(588, 890)
    context.lineTo(212, 890)
    context.lineTo(200, 372)
    context.lineTo(70, 418)
    context.lineTo(40, 268)
    context.lineTo(160, 214)
  }

  context.closePath()
  context.fillStyle = color
  context.fill()
  context.strokeStyle = 'rgba(28, 30, 33, 0.35)'
  context.lineWidth = 2
  context.stroke()
  context.globalCompositeOperation = 'destination-out'
  context.beginPath()

  if (style === 'hoodie') {
    context.ellipse(400, 248, side === 'front' ? 48 : 34, side === 'front' ? 26 : 18, 0, 0, Math.PI * 2)
  } else if (style === 'tank') {
    context.ellipse(400, 210, side === 'front' ? 64 : 38, side === 'front' ? 34 : 22, 0, 0, Math.PI * 2)
  } else {
    context.ellipse(400, 214, side === 'front' ? 78 : 42, side === 'front' ? 46 : 28, 0, 0, Math.PI * 2)
  }

  context.fill()
  context.globalCompositeOperation = 'source-over'
}
