import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET env var');
  return new TextEncoder().encode(secret);
};

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

export async function requireAdmin(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    return payload; // { id, email, role }
  } catch {
    return null;
  }
}
