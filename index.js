const xInput = document.getElementById("xInput")
const yInput = document.getElementById("yInput")
const warning = document.getElementById("warning")

const predictXInput = document.getElementById("predictXInput")
const predictYOutput = document.getElementById("predictYOutput")
const predictBtn = document.getElementById("predictBtn")

let currentA = null
let currentB = null

const outputFields = {
  equation: document.getElementById("equation"),
  type: document.getElementById("corr-type"),
  level: document.getElementById("corr-level"),
  pearson: document.getElementById("pearson"),
  r2: document.getElementById("r2"),
  epsilon: document.getElementById("sigma-epsilon"),
}

const updateOutput = () => {
  const xRaw = xInput.value
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n))
  const yRaw = yInput.value
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n))

  const nX = xRaw.length
  const nY = yRaw.length

  warning.classList.add("hidden")
  warning.textContent = ""

  if (nX > 0 && nY > 0 && nX !== nY) {
    warning.textContent = `Jumlah data X (${nX}) tidak sama dengan Y (${nY}). Harap pastikan jumlahnya sama.`
    warning.classList.remove("hidden")
    Object.values(outputFields).forEach((el) => (el.textContent = "-"))
    return
  }

  if (nX < 2 || nY < 2) {
    warning.textContent = `Minimal diperlukan 2 pasang data untuk menghitung regresi.`
    warning.classList.remove("hidden")
    Object.values(outputFields).forEach((el) => (el.textContent = "-"))
    return
  }

  const allXSame = xRaw.every((xi) => xi === xRaw[0])

  if (allXSame) {
    warning.textContent = `Semua nilai X sama (${xRaw[0]}). Tidak bisa membentuk garis regresi.`
    warning.classList.remove("hidden")
    Object.values(outputFields).forEach((el) => (el.textContent = "-"))
    return
  }

  if (nX === 0 || nY === 0) {
    Object.values(outputFields).forEach((el) => (el.textContent = "-"))
    return
  }

  const n = nX

  let sigma_xy = 0,
    sigma_x = 0,
    sigma_y = 0,
    sigma_x2 = 0,
    sigma_y2 = 0
  for (let i = 0; i < n; i++) {
    const xi = xRaw[i],
      yi = yRaw[i]
    sigma_x += xi
    sigma_y += yi
    sigma_xy += xi * yi
    sigma_x2 += xi ** 2
    sigma_y2 += yi ** 2
  }

  const sigma_x_squared = sigma_x ** 2
  const sigma_y_squared = sigma_y ** 2

  const b =
    (n * sigma_xy - sigma_x * sigma_y) / (n * sigma_x2 - sigma_x_squared)
  const a = (sigma_y - b * sigma_x) / n

  currentA = a
  currentB = b

  const yHat = xRaw.map((x) => b * x + a)
  const epsilon = yRaw.map((y, i) => y - yHat[i])
  const epsilonSquared = epsilon.map((e) => e ** 2)
  const sigmaEpsilon = epsilonSquared.reduce((sum, e) => sum + e, 0)

  const r =
    (n * sigma_xy - sigma_x * sigma_y) /
    Math.sqrt(
      (n * sigma_x2 - sigma_x_squared) * (n * sigma_y2 - sigma_y_squared)
    )
  const r2 = r ** 2
  const corrType = r >= 0 ? "Positif" : "Negatif"
  const absR = Math.abs(r)
  const corrLevel =
    absR < 0.01
      ? "Tidak Berkorelasi"
      : absR < 0.2
      ? "Sangat Lemah"
      : absR < 0.4
      ? "Lemah"
      : absR < 0.6
      ? "Sedang"
      : absR < 0.8
      ? "Kuat"
      : "Sangat Kuat"

  outputFields.equation.innerHTML = `
    ŷ = <strong>${a.toFixed(4)}</strong> + <strong>${b.toFixed(4)}</strong> x
    <br><small><em>di mana b adalah kemiringan (slope) yang dikalikan dengan x</em></small>
  `
  outputFields.type.textContent = corrType
  outputFields.level.textContent = corrLevel
  outputFields.pearson.textContent = r.toFixed(6)
  outputFields.r2.textContent = (r2 * 100).toFixed(6)

  outputFields.epsilon.innerHTML = `
    Σε² = <strong>${sigmaEpsilon.toFixed(4)}</strong>
    <br><small><em>ε = y - ŷ (residu/error)</em></small>
  `

  // Tampilkan rumus-rumus yang digunakan
  const rumusContainer = document.getElementById("rumus-container")
  rumusContainer.innerHTML = `
    <h3 class="font-semibold mt-4 mb-2">Rumus yang digunakan:</h3>
    <ul class="list-disc list-inside text-sm text-gray-700">
      <li>𝑎 = (Σy - b Σx) / n</li>
      <li>b = (n Σxy - Σx Σy) / (n Σx² - (Σx)²)</li>
      <li>r (koefisien korelasi Pearson) = (n Σxy - Σx Σy) / √[(n Σx² - (Σx)²)(n Σy² - (Σy)²)]</li>
      <li>R² = r² (koefisien determinasi)</li>
      <li>ε = y - ŷ (residu/error)</li>
      <li>Σε² = jumlah kuadrat error (total squared error)</li>
    </ul>
  `

  predictYOutput.textContent = "-"
}

xInput.addEventListener("input", updateOutput)
yInput.addEventListener("input", updateOutput)

predictBtn.addEventListener("click", () => {
  const xVal = parseFloat(predictXInput.value.replace(",", "."))
  if (isNaN(xVal)) {
    predictYOutput.textContent = "Masukkan angka valid untuk prediksi X"
    return
  }
  if (currentA === null || currentB === null) {
    predictYOutput.textContent = "Hitung regresi dulu dengan input X dan Y"
    return
  }
  const yHat = currentA + currentB * xVal
  predictYOutput.textContent = yHat.toFixed(4)
})