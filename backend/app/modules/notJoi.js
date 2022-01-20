/* 
  Available methods:
  - required
  - object
  - String
    - alphanum
    - trim
    - length
    - min
    - max
    - lowercase
    - uppercase
    - email
  
*/

class CustomValidator {
  constructor() {
    function isString(value) {
      if (typeof value != "string") {
        return false;
      }
      return true;
    }

    function isObject(value) {
      if (typeof value != "object" || Array.isArray(value)) {
        return false;
      }
      return true;
    }

    function isArray(value) {
      if (!Array.isArray(value)) {
        return false;
      }
      return true;
    }

    this.types = new Map([
      ["string", isString],
      ["object", isObject],
      ["array", isArray]
    ]);
  }
  _validate(val) {
    var returnValue = { value: val };
    const valueType = this.type;
    const typeValidator = this.types.get(valueType);

    if (typeof val == "undefined") {
      if (this.isRequired) {
        return {
          value: val,
          error: '"value" is required'
        };
      } else {
        return { value: val };
      }
    }

    if (!typeValidator(val)) {
      return {
        value: val,
        error: `"value" must be a ${valueType}`
      };
    }

    this.validators.find(function findFirstError(validator) {
      const { value, error } = validator(val);
      returnValue.value = value;
      val = value;
      if (error) {
        returnValue.error = error;
        return true;
      }
    });

    return returnValue;
  }
  _required() {
    this.isRequired = true;
    return this;
  }
  string() {
    function alphanum() {
      this.validators.push(isAlphanum);

      function isAlphanum(value) {
        const alphanumRegex = /^[0-9a-z]+$/gi;

        if (!value.match(alphanumRegex)) {
          return {
            value: value,
            error: '"value" must be alpha numeric'
          };
        } else {
          return { value };
        }
      }

      return this;
    }

    function trim() {
      this.validators.push(trimString);

      function trimString(value) {
        return { value: value.trim() };
      }

      return this;
    }

    function length(n) {
      this.validators.push(compareLength);

      function compareLength(value) {
        if (value.length != n) {
          return {
            value: value,
            error: `"value" length must be equal to ${n}`
          };
        }
        return { value };
      }
      return this;
    }

    function min(n) {
      this.validators.push(isMin);

      function isMin(value) {
        if (value.length < n) {
          return {
            value: value,
            error: `"value" should be at least ${n} characters`
          };
        }
        return { value };
      }
      return this;
    }

    function max(n) {
      this.validators.push(isMax);

      function isMax(value) {
        if (value.length > n) {
          return {
            value: value,
            error: `"value" should be at most ${n} characters`
          };
        }
        return { value };
      }
      return this;
    }

    function lowercase() {
      this.validators.push(toLowercase);

      function toLowercase(value) {
        return { value: value.toLowerCase() };
      }

      return this;
    }

    function uppercase() {
      this.validators.push(toUppercase);

      function toUppercase(value) {
        return { value: value.toUpperCase() };
      }

      return this;
    }

    function email() {
      this.validators.push(isValidEmail);

      function isValidEmail(value) {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const [user, domain] = value.split("@");
        if (
          !user ||
          !domain ||
          user.length > 64 ||
          domain.length > 189 ||
          value.length > 254 ||
          !value.match(emailRegex)
        ) {
          return {
            value: value,
            error: '"value" is not a valid email address'
          };
        }
        return { value };
      }

      return this;
    }

    function password() {
      this.validators.push(isValidPassword);

      function isValidPassword(value) {
        const passwordRegex =
          /^.*(?=.{8,})(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=-_]).*$/;
        if (value.length < 8) {
          return {
            error:
              "Your password must be at least 8 characters long. Please try another."
          };
        } else if (value.length > 64) {
          return {
            error:
              "Your password is must had a maximum length of 64, please try another."
          };
        } else if (!value.match(passwordRegex)) {
          return {
            error:
              "Please choose a more secure password. Try a mix of letters, numbers and symbols."
          };
        }
        return { value };
      }
      return this;
    }
    return {
      type: "string",
      validators: [],
      isRequired: false,
      trim,
      alphanum,
      length,
      min,
      max,
      lowercase,
      uppercase,
      email,
      password,
      validate: this._validate,
      required: this._required,
      types: this.types
    };
  }
  object(schemaObj) {
    function validateObject(value) {
      const expectedType = this.type;
      const typeValidator = this.types.get(expectedType);
      var errors = [];
      var newValue = {};
      if (typeof value == "undefined" && !this.isRequired) {
        return { value: value };
      }

      if (!typeValidator(value)) {
        return { value: value, error: '"value" is not an object' };
      }

      for (const [key, schemaValue] of Object.entries(schemaObj)) {
        // if it is on the schema object but not on the passed value.
        if (schemaValue.isRequired && value[key] != "" && !value[key]) {
          errors.push(`${key} is required`);
          continue;
        } else if (!schemaValue.isRequired && value[key] != "" && !value[key]) {
          continue;
        }

        const validationResult = schemaValue.validate(value[key]);
        if (validationResult.error) {
          errors.push(validationResult.error.replace("value", key));
        } else {
          value[key] = validationResult.value;
        }
        newValue[key] = value[key];
        delete value[key];
      }

      Object.keys(value).forEach((key) => {
        errors.push(`${key} is not allowed`);
      });

      return errors.length > 0
        ? { value: newValue, errors }
        : { value: newValue };
    }
    return {
      type: "object",
      types: this.types,
      isRequired: false,
      required: this._required,
      validate: validateObject
    };
  }
  array() {
    function min(min) {
      this.validators.push(isMin);

      function isMin(value) {
        if (value.length < min) {
          return {
            value: value,
            error: `"value" should be at least of size ${min}`
          };
        }
        return { value };
      }

      return this;
    }

    function max(max) {
      this.validators.push(isMax);

      function isMax(value) {
        if (value.length > max) {
          return {
            value: value,
            error: `"value" should be at most of size ${max}`
          };
        }
        return { value };
      }
      return this;
    }

    function length(len) {
      this.validators.push(isLen);

      function isLen(value) {
        if (value.length != len) {
          return {
            value: value,
            error: `"value" should be of size ${len}`
          };
        }
        return { value };
      }
      return this;
    }

    return {
      type: "array",
      validators: [],
      types: this.types,
      isRequired: false,
      min: min,
      max: max,
      length: length,
      required: this._required,
      validate: this._validate
    };
  }
}

const notJoi = new CustomValidator();

module.exports = notJoi;
