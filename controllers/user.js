import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import validateEmail from '../utils/validateEmail.js';
import validatePassword from '../utils/validatePassword.js';
import matchPasswords from '../utils/matchPasswords.js';
import hashPassword from '../utils/hashPassword.js';

import query from '../config/db.js';
import createUsersTable from '../models/user.js';

const userControllers = {
    register: async (req, res) => {
        const { email, password, rePassword } = req.body;

        try{
            // Check if email already exists
            const checkEmailQuery = `SELECT * FROM users WHERE email=?`;
            const checkEmailParams = [email];
            const result = await query(checkEmailQuery, checkEmailParams);

            if (result.length > 0) {
                return res.status(400).render('404', {
                    title: 'Email already exists',
                    message: 'Email already exists, please register'
                });
            }

            const isValidEmail = validateEmail(email);
            const isValidPassword = validatePassword(password);
            const doPasswordMatch = matchPasswords(password, rePassword);

            if (isValidEmail && isValidPassword && doPasswordMatch) {
                // Hash the password
                const hashedPassword = await hashPassword(password); // Ensure this is async
                const sqlQuery = `INSERT INTO users (email, password) VALUES (?, ?)`;
                const params = [email, hashedPassword];
                const results = await query(sqlQuery, params);
             
                if (results.affectedRows > 0) {
                   return res.status(302).redirect('/api/login'); // Consider adding a success message
                } else {
                    return res.status(400).render('404', {
                       title: 'Registration failed',
                       message: 'Failed to register user'
                    });
                }
            } else {
                return res.status(400).render('404', {
                   title: 'Invalid input',
                   message: 'Please check your inputs'
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render('404', {
                title: 'Server error',
                message: 'An error occurred during registration'
            });
        }
    },
    
    login: async (req, res) => {
        const {email, password} = req.body;
        const sqlQuery = `SELECT * FROM users WHERE email=?`;
        const params = [email];
        const results = await query(sqlQuery, params);

        if (results.length === 0) {
            return res.status(400).render('404', {
                title: 'Email does not exist',
                message: 'Email does not exist, please register'
            });
        }
        //check if password matches
        bcrypt.compare(password, results[0].password, (err, valid) => {
            if (err) {
                console.log(err);
            }
            if (!valid) {
                return res.status(400).render('404', {
                    title: 'Invalid email or password',
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign({email}, process.env.TOKEN_SECRET);

            res.cookie('token', token, {httpOnly: true});
            res.status(302).redirect('/api/flights');
        });

    },
    logout: (req, res) => {
        res.clearCookie('token');
        res.status(302).redirect('/api/flights')
    },
    getRegisterForm: (req, res) => {
        res.status(200).render('register-form')
    },
    getLoginForm: (req, res) => {
        res.status(200).render('login-form')
    },
    
}

export default userControllers;