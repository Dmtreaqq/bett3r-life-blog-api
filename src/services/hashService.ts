import bcrypt from 'bcrypt'

export const hashService = {
    async hashPassword(password: string): Promise<string | null> {
        try {
            return await bcrypt.hash(password, 10);
        } catch (err) {
            console.log(err)
            return null
        }
    },

    async checkPassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
