/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const { expect } = require( 'chai' );
const sinon = require( 'sinon' );
const proxyquire = require( 'proxyquire' );
const utils = require( '../../../lib/validators/utils' );
const testUtils = require( '../../utils' );

describe( 'dev-docs/validators/see-validator', function() {
	this.timeout( 10 * 1000 );

	const FIXTURES_PATH = testUtils.normalizePath( __dirname, 'fixtures' );
	const SOURCE_FILES = testUtils.normalizePath( FIXTURES_PATH, '**', '*.ts' );
	const TSCONFIG_PATH = testUtils.normalizePath( FIXTURES_PATH, 'tsconfig.json' );

	const onErrorCallback = sinon.stub();

	before( async () => {
		const validators = proxyquire( '../../../lib/validators', {
			'./see-validator': project => {
				return require( '../../../lib/validators/see-validator' )( project, onErrorCallback );
			}
		} );

		const build = proxyquire( '../../../lib/build', {
			'./validators': validators
		} );

		await build( {
			cwd: FIXTURES_PATH,
			tsconfig: TSCONFIG_PATH,
			sourceFiles: [ SOURCE_FILES ],
			validateOnly: false,
			strict: false
		} );
	} );

	it( 'should warn if link is not valid', () => {
		const expectedErrors = [
			{
				identifier: '.property',
				source: 'see.ts:60'
			},
			{
				identifier: '#staticProperty',
				source: 'see.ts:60'
			},
			{
				identifier: '#property-non-existing',
				source: 'see.ts:60'
			},
			{
				identifier: '#property:LABEL-NON-EXISTING',
				source: 'see.ts:60'
			},
			{
				identifier: '#method:LABEL-NON-EXISTING',
				source: 'see.ts:60'
			},
			{
				identifier: '#methodWithoutComment:LABEL-NON-EXISTING',
				source: 'see.ts:60'
			},
			{
				identifier: '#methodWithoutLabel:LABEL-NON-EXISTING',
				source: 'see.ts:60'
			},
			{
				identifier: '#event-example',
				source: 'see.ts:60'
			},
			{
				identifier: '#event:property',
				source: 'see.ts:60'
			},
			{
				identifier: '~ClassNonExisting#property',
				source: 'see.ts:60'
			},
			{
				identifier: 'module:non-existing/module~ClassWithSeeTags#property',
				source: 'see.ts:60'
			},
			{
				identifier: 'module:non-existing/module~Foo#bar',
				source: 'see.ts:97'
			},
			{
				identifier: 'module:non-existing/module~Foo#bar',
				source: 'see.ts:97'
			}
		];

		expect( onErrorCallback.callCount ).to.equal( expectedErrors.length );

		for ( const error of expectedErrors ) {
			expect( onErrorCallback ).to.be.calledWith(
				`Target doclet for "${ error.identifier }" identifier is not found.`,
				sinon.match( reflection => {
					const source = utils.getSource( reflection );

					return error.source === `${ source.fileName }:${ source.line }`;
				} )
			);
		}
	} );
} );
