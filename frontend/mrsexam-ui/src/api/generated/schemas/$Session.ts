/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Session = {
    properties: {
        sessionNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        resultDate: {
            type: 'string',
            isNullable: true,
            format: 'date-time',
        },
        resultPrinted: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        closeFlag: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        month: {
            type: 'string',
            isNullable: true,
            maxLength: 20,
        },
        defa: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenPandit: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenPraveen: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenPrabodh: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenSubodh: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenPraveshika: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenPrathamik: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        resgenBalbodhini: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        backup: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
    },
} as const;
