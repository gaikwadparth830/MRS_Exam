/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Grade = {
    properties: {
        gradeNo: {
            type: 'string',
            isRequired: true,
            maxLength: 10,
            minLength: 1,
        },
        gradeName: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        gradeNameCert: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
    },
} as const;
