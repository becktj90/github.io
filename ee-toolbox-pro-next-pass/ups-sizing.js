// SAVE AS: ups-sizing.js

const factors = {
  linear: 1.0,
  nonlinear: 1.15,
  motor: 1.2
};

function addRow() {
  const row = `
    <tr>
      <td><input value="Load"></td>
      <td>
        <select>
          <option value="linear">Linear</option>
          <option value="nonlinear">Nonlinear</option>
          <option value="motor">Motor</option>
        </select>
      </td>
      <td><input value="50"></td>
      <td><input value="0.95"></td>
      <td><input value="1"></td>
    </tr>
  `;
  document.querySelector("#table tbody").innerHTML += row;
}

function calculate() {
  const rows = document.querySelectorAll("#table tbody tr");
  const V = Number(document.getElementById("voltage").value);
  const runtime = Number(document.getElementById("runtime").value);

  let kva = 0;
  let kw = 0;

  rows.forEach(r => {
    const cells = r.querySelectorAll("input, select");

    const type = cells[1].value;
    const I = Number(cells[2].value);
    const pf = Number(cells[3].value);
    const demand = Number(cells[4].value);

    const s = Math.sqrt(3) * V * I / 1000 * demand;
    const p = s * pf;

    kva += s * factors[type];
    kw += p * factors[type];
  });

  const batteryKwh = kw * runtime / 60;

  document.getElementById("results").innerHTML = `
    <p>Total kVA: ${kva.toFixed(1)}</p>
    <p>Total kW: ${kw.toFixed(1)}</p>
    <p>Battery Required: ${batteryKwh.toFixed(1)} kWh</p>
  `;
}
