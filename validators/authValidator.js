/** @format */

import Joi from 'joi';

export const signinSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'email must be a valid email',
    'string.base': 'email should be a type of string',
    'string.empty': 'email is not allowed to be empty field',
  }),
  password: Joi.string()
    .required()
    .min(8)
    .max(12)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
      'string.base': 'password should be a type of text',  
      'string.empty': 'password can not be empty',
      'string.min': 'password should have minimum length of 8',
      'string.max':'password is less than or equal to ten character',
      'string.pattern':
        'password must contain atleast one uppercase letter,one lowercase letter one number, one special character',
      'any.required': 'password is required',
    }),
});

export const signupSchema = Joi.object({
    firstName:Joi.string()
    .required()
    .messages({
        'string.base':'firstName must be string',
        'string.empty':'firstName can not be empty',
        'any.required':'firstName is required'
    }),
    lastName:Joi.string()
    .required()
    .messages({
        'string.base':'lastName must be string',
        'string.empty':'lastName can not be empty',
        'any.required':'lastName is required'
    }),
    email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'email must be a valid email',
    'string.base': 'email should be a type of string',
    'string.empty': 'email is not allowed to be empty field',
  }),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .messages({
      'string.base': 'password should be a type of text',  
      'string.empty': 'password can not be empty',
      'string.min': 'password should have minimum length of 8',
      'string.pattern':
        'password must contain atleast one uppercase letter,one lowercase letter one number, one special character',
      'any.required': 'password is required',
    }),
    confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'string.base':'Please match your password and confirm password'
    })
    
})