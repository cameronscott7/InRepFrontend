/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Data } from '../models/Data';
import type { Error } from '../models/Error';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TestService {
    /**
     * Get test data
     * @returns Data OK
     * @returns Error Default error response
     * @throws ApiError
     */
    public static getApiV1Test(): CancelablePromise<Data | Error> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/test/',
        });
    }
}
