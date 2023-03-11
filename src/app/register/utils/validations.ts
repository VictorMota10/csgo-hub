import { object, string, ref } from "yup";

export const onlyLetters = /^[A-Za-z]+$/;

const REQUIRED_FIELD_MESSAGE = "Campo obrigatório";

const regexPassword = new RegExp(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z$*&@#]{8,}$/
);

export const validations = object().shape({
  password: string()
    .required(REQUIRED_FIELD_MESSAGE)
    .min(8, "At least 8 characters.")
    .test("password", "Senha não possui o padrão minimo", (value, context) => {
      let result = true;
      if (value) {
        result = regexPassword.test(value);
      }

      return result;
    }),
  confirmPassword: string()
    .required(REQUIRED_FIELD_MESSAGE)
    .min(8, "At least 8 characters.")
    .oneOf([ref("password"), ""], "Passwords must be identical."),
});
