import * as bcrypt from 'bcrypt';


const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}

export { hashPassword, verifyPassword }