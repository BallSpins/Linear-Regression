const DOM = {
  xInput: document.getElementById("xInput"),
  yInput: document.getElementById("yInput"),
  warning: document.getElementById("warning"),
  predictXInput: document.getElementById("predictXInput"),
  predictYOutput: document.getElementById("predictYOutput"),
  rumusContainer: document.getElementById("rumus-container"),
  findXbarInput: document.getElementById('findXbarInput'),
  findYbarInput: document.getElementById('findYbarInput'),
  findSSxyInput: document.getElementById('findSSxyInput'),
  findSSxxInput: document.getElementById('findSSxxInput'),
  findYoutput: document.getElementById('findYOutput'),
  outputFields: {
    equation: document.getElementById("equation"),
    type: document.getElementById("corr-type"),
    level: document.getElementById("corr-level"),
    pearson: document.getElementById("pearson"),
    r2: document.getElementById("r2"),
    epsilon: document.getElementById("epsilon"),
    epsilon_squared: document.getElementById("epsilon-squared"),
    sigma_epsilon: document.getElementById("sigma-epsilon"),
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
  DOM.outputFields.sigma_epsilon.innerHTML = "-"
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

  const x_bar = xRaw.reduce((acc, curr) => acc + curr, 0) / n
  const y_bar = yRaw.reduce((acc, curr) => acc + curr, 0) / n
  const sigma_x_squared = sigma_x**2

  const SSxy = sigma_xy - (sigma_x * sigma_y) / n
  const SSxx = sigma_x2 - sigma_x_squared / n
  const b = SSxy / SSxx
  const a = y_bar - b * x_bar

  if (!isFinite(a) || !isFinite(b)) return null

  const yHat = xRaw.map(x => b * x + a)
  const epsilon = yRaw.map((y, i) => y - yHat[i])
  const epsilonSquared = epsilon.map(e => e**2)
  const sigmaEpsilon = epsilonSquared.reduce((sum, e) => sum + e, 0)

  console.log(epsilon)
  console.log(epsilonSquared)
  console.log(sigmaEpsilon)

  const r = (n * sigma_xy - sigma_x * sigma_y) /
    Math.sqrt((n * sigma_x2 - sigma_x ** 2) * (n * sigma_y2 - sigma_y ** 2))

  return { a, b, r, r2: r ** 2, epsilon, epsilonSquared, sigmaEpsilon }
}

function renderOutputs({ a, b, r, r2, epsilon, epsilonSquared, sigmaEpsilon }) {
  console.log(epsilon)
  console.log(epsilonSquared)
  console.log(sigmaEpsilon)
  
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
  // DOM.outputFields.epsilon = epsilon.toFixed(6)
  // DOM.outputFields.epsilon_squared = epsilonSquared.toFixed(6)
  DOM.outputFields.sigma_epsilon.innerHTML = `
    ${sigmaEpsilon.toFixed(6)}
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

function handleFindY() {
  const x_bar = parseFloat(DOM.findXbarInput.value.trim())
  const y_bar = parseFloat(DOM.findYbarInput.value.trim())
  const SSxy = parseFloat(DOM.findSSxyInput.value.trim())
  const SSxx = parseFloat(DOM.findSSxxInput.value.trim())

  if(!isNaN(x_bar) && !isNaN(y_bar) && !isNaN(SSxy) && !isNaN(SSxx)) {
    const bfy = SSxy/SSxx
    console.log(bfy)
    const afy1 = y_bar - parseFloat(bfy.toFixed(1)) * x_bar
    const afy2 = y_bar - parseFloat(bfy.toFixed(2)) * x_bar
    const afy4 = y_bar - parseFloat(bfy.toFixed(4)) * x_bar
    const afy = (afy1 + afy2 + afy4) / 3
    console.log(afy)
    const sign = afy < 0 ? '-' : '+'
    DOM.findYoutput.textContent = `${bfy.toFixed(4)}x ${sign} ${afy.toFixed(4)}`
  } else {
    DOM.findYoutput.textContent = '-'
  }
}

// Attach event listeners
DOM.xInput.addEventListener("input", updateOutput)
DOM.yInput.addEventListener("input", updateOutput)
DOM.predictXInput.addEventListener("input", handlePrediction)
DOM.findXbarInput.addEventListener('input', handleFindY)
DOM.findYbarInput.addEventListener('input', handleFindY)
DOM.findSSxyInput.addEventListener('input', handleFindY)
DOM.findSSxxInput.addEventListener('input', handleFindY)
