import jwt from 'jsonwebtoken'

export const generateToken = (userId, tokenVersion) => {
    return jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
}