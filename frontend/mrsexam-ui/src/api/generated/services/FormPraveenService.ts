/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FormPraveen } from '../models/FormPraveen';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FormPraveenService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveen(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiFormPraveen({
        requestBody,
    }: {
        requestBody?: FormPraveen,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/FormPraveen',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveenPaged({
        pageNumber = 1,
        pageSize = 50,
        sessionNo,
    }: {
        pageNumber?: number,
        pageSize?: number,
        sessionNo?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/paged',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveen1({
        rollNo,
        regionNo,
        sessionNo,
    }: {
        rollNo: number,
        regionNo: number,
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/{rollNo}/{regionNo}/{sessionNo}',
            path: {
                'rollNo': rollNo,
                'regionNo': regionNo,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiFormPraveen({
        rollNo,
        regionNo,
        sessionNo,
        requestBody,
    }: {
        rollNo: number,
        regionNo: number,
        sessionNo: number,
        requestBody?: FormPraveen,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/FormPraveen/{rollNo}/{regionNo}/{sessionNo}',
            path: {
                'rollNo': rollNo,
                'regionNo': regionNo,
                'sessionNo': sessionNo,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiFormPraveen({
        rollNo,
        regionNo,
        sessionNo,
    }: {
        rollNo: number,
        regionNo: number,
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/FormPraveen/{rollNo}/{regionNo}/{sessionNo}',
            path: {
                'rollNo': rollNo,
                'regionNo': regionNo,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveenSession({
        sessionNo,
    }: {
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/session/{sessionNo}',
            path: {
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveenRegion({
        regionNo,
    }: {
        regionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/region/{regionNo}',
            path: {
                'regionNo': regionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveenUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveenCentre({
        centreCode,
    }: {
        centreCode: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/centre/{centreCode}',
            path: {
                'centreCode': centreCode,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveenName({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveen/name/{name}',
            path: {
                'name': name,
            },
        });
    }
}
