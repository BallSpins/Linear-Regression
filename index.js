const DOM = {
  xInput: document.getElementById("xInput"),
  yInput: document.getElementById("yInput"),
  warning: document.getElementById("warning"),
  predictXInput: document.getElementById("predictXInput"),
  predictYOutput: document.getElementById("predictYOutput"),
  rumusContainer: document.getElementById("rumus-container"),
  outputFields: {
    equation: document.getElementById("equation"),
    type: document.getElementById("corr-type"),
    level: document.getElementById("corr-level"),
    pearson: document.getElementById("pearson"),
    r2: document.getElementById("r2"),
    epsilon: document.getElementById("sigma-epsilon"),
  },
}

let currentA = null
let currentB = null

function getInputValues() {
  const x = DOM.xInput.value.split(",").map(s => parseFloat(s.trim()))
  const y = DOM.yInput.value.split(",").map(s => parseFloat(s.trim()))
  const validX = x.filter(n => !isNaN(n))
  const validY = y.filter(n => !isNaN(n))
  return { x: validX, y: validY }
}

function showWarning(message) {
  DOM.warning.textContent = message
  DOM.warning.classList.remove("hidden")
}

function clearWarning() {
  DOM.warning.classList.add("hidden")
  DOM.warning.textContent = ""
}

function clearOutputs() {
  Object.values(DOM.outputFields).forEach(el => el.textContent = "-")
  DOM.outputFields.equation.innerHTML = "-"
  DOM.outputFields.epsilon.innerHTML = "-"
  DOM.rumusContainer.innerHTML = ""
}

function calculateRegression(xRaw, yRaw) {
  const n = xRaw.length
  let sigma_x = 0, sigma_y = 0, sigma_xy = 0, sigma_x2 = 0, sigma_y2 = 0

  for (let i = 0; i < n; i++) {
    sigma_x += xRaw[i]
    sigma_y += yRaw[i]
    sigma_xy += xRaw[i] * yRaw[i]
    sigma_x2 += xRaw[i] ** 2
    sigma_y2 += yRaw[i] ** 2
  }

  const SSxy = sigma_xy - (sigma_x * sigma_y) / n
  const SSxx = sigma_x2 - sigma_x_squared / n
  const b = SSxy / SSxx
  const a = y_bar - b * x_bar

  if (!isFinite(a) || !isFinite(b)) return null

  const yHat = xRaw.map(x => b * x + a)
  const epsilon = yRaw.map((y, i) => y - yHat[i])
  const sigmaEpsilon = epsilon.reduce((sum, e) => sum + e ** 2, 0)

  const r = (n * sigma_xy - sigma_x * sigma_y) /
    Math.sqrt((n * sigma_x2 - sigma_x ** 2) * (n * sigma_y2 - sigma_y ** 2))

  return { a, b, r, r2: r ** 2, sigmaEpsilon }
}

function renderOutputs({ a, b, r, r2, sigmaEpsilon }) {
  currentA = a
  currentB = b

  const corrType = r >= 0 ? "Positif" : "Negatif"
  const absR = Math.abs(r)
  const corrLevel = absR < 0.01 ? "Tidak Berkorelasi" :
                    absR < 0.2 ? "Sangat Lemah" :
                    absR < 0.4 ? "Lemah" :
                    absR < 0.6 ? "Sedang" :
                    absR < 0.8 ? "Kuat" : "Sangat Kuat"

  DOM.outputFields.equation.innerHTML = `
    ŷ = <strong>${a.toFixed(4)}</strong> + <strong>${b.toFixed(4)}</strong> x
    <br><small><em>di mana b adalah kemiringan (slope)</em></small>
  `
  DOM.outputFields.type.textContent = corrType
  DOM.outputFields.level.textContent = corrLevel
  DOM.outputFields.pearson.textContent = r.toFixed(6)
  DOM.outputFields.r2.textContent = (r2 * 100).toFixed(6)
  DOM.outputFields.epsilon.innerHTML = `
    Σε² = <strong>${sigmaEpsilon.toFixed(4)}</strong>
    <br><small><em>ε = y - ŷ</em></small>
  `
}

function renderFormulas() {
  DOM.rumusContainer.innerHTML = `
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
}

function updateOutput() {
  const { x, y } = getInputValues()

  clearWarning()

  if (x.length !== y.length) {
    clearOutputs()
    showWarning(`Jumlah data X (${x.length}) tidak sama dengan Y (${y.length})`)
    return
  }

  if (x.length < 2) {
    clearOutputs()
    showWarning("Minimal diperlukan 2 pasang data.")
    return
  }

  if (x.every(val => val === x[0])) {
    clearOutputs()
    showWarning("Semua nilai X sama. Tidak bisa regresi.")
    return
  }

  const result = calculateRegression(x, y)
  if (!result) {
    clearOutputs()
    showWarning("Perhitungan gagal. Cek input.")
    return
  }

  renderOutputs(result)
  renderFormulas()
  DOM.predictYOutput.textContent = "-"
}

function handlePrediction() {
  const x = parseFloat(DOM.predictXInput.value.trim())
  if (!isNaN(x) && currentA !== null && currentB !== null) {
    DOM.predictYOutput.textContent = (currentB * x + currentA).toFixed(4)
  } else {
    DOM.predictYOutput.textContent = "-"
  }
}

// Attach event listeners
DOM.xInput.addEventListener("input", updateOutput)
DOM.yInput.addEventListener("input", updateOutput)
DOM.predictXInput.addEventListener("input", handlePrediction)
