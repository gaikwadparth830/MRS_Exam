/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Paper = {
    properties: {
        paperNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        examNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        paperName: {
            type: 'string',
            isNullable: true,
            maxLength: 40,
        },
        passingMarks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        exemptionMarks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        minMarks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
    },
} as const;
