/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Exam = {
    properties: {
        examNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        examName: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        sessionNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        noOfPapers: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        fees: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        attSheetPrinted: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resultGenFlag: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        minTotalKhand1: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        minTotalKhand2: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        class1Marks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        class2Marks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        class3Marks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        distMarks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
    },
} as const;
