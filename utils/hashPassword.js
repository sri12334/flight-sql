import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // Asynchronously generate salt
    return await bcrypt.hash(password, salt); // Asynchronously hash the password
};

export default hashPassword;