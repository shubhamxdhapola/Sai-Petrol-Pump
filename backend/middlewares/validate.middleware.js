import { formatError, ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const { formErrors, fieldErrors } = error.flatten();
            return res.status(400).json({
                message: "Validation failed",
                formErrors,
                fieldErrors
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export default validate;