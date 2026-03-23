/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Result = {
    properties: {
        resultId: {
            type: 'number',
            format: 'int32',
        },
        resultValue: {
            type: 'string',
            isNullable: true,
            maxLength: 100,
        },
        description: {
            type: 'string',
            isNullable: true,
            maxLength: 100,
        },
        exam: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
    },
} as const;
