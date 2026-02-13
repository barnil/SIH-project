export async function validateEshram(uan, dob) {
  const res = await fetch('/api/updates/eshram/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uan, dob }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function rgiVerifyBirth({ regNo, fullName, dob, gender, format = 'pdf', user = {} }) {
  const res = await fetch('/api/updates/rgi/birth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regNo, fullName, dob, gender, format, ...user }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function rgiVerifyDeath({ regNo, fullName, gender_deceased, dec_name, dod, relation, format = 'pdf', user = {} }) {
  const res = await fetch('/api/updates/rgi/death', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regNo, fullName, gender_deceased, dec_name, dod, relation, format, ...user }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
