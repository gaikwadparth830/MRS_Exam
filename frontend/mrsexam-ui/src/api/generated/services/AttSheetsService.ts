/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttSheet } from '../models/AttSheet';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttSheetsService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiAttSheets(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/AttSheets',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAttSheets({
        requestBody,
    }: {
        requestBody?: AttSheet,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/AttSheets',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiAttSheets1({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/AttSheets/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiAttSheets({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: AttSheet,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/AttSheets/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiAttSheets({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/AttSheets/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiAttSheetsCentre({
        examCentre,
    }: {
        examCentre: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/AttSheets/centre/{examCentre}',
            path: {
                'examCentre': examCentre,
            },
        });
    }
}
