/* ─── Token Generation ─── */
function generateToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 86400, 
    iat: Math.floor(Date.now() / 1000),
    sub: Math.random().toString(36).substring(2, 15),
  }))
  const signature = btoa('secret-key')
  return `${header}.${payload}.${signature}`
}

function storeToken(token: string): void {
  localStorage.setItem('sheetforge_jwt_token', token)
  localStorage.setItem('token_created_at', new Date().toISOString())
}

export  {generateToken,storeToken}