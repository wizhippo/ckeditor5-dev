/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const { expect } = require( 'chai' );
const sinon = require( 'sinon' );
const proxyquire = require( 'proxyquire' );
const utils = require( '../../../lib/validators/utils' );
const testUtils = require( '../../utils' );

describe( 'dev-docs/validators/fires-validator', function() {
	this.timeout( 10 * 1000 );

	const FIXTURES_PATH = testUtils.normalizePath( __dirname, 'fixtures' );
	const SOURCE_FILES = testUtils.normalizePath( FIXTURES_PATH, '**', '*.ts' );
	const TSCONFIG_PATH = testUtils.normalizePath( FIXTURES_PATH, 'tsconfig.json' );

	const onErrorCallback = sinon.stub();

	before( async () => {
		const validators = proxyquire( '../../../lib/validators', {
			'./fires-validator': project => {
				return require( '../../../lib/validators/fires-validator' )( project, onErrorCallback );
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

	it( 'should warn if fired event does not exist', () => {
		const expectedErrors = [
			{
				identifier: '#event:event-non-existing',
				source: 'fires.ts:15'
			},
			{
				identifier: '#event:property',
				source: 'fires.ts:15'
			},
			{
				identifier: '#event:event-non-existing',
				source: 'fires.ts:27'
			},
			{
				identifier: '#event:property',
				source: 'fires.ts:27'
			},
			{
				identifier: 'module:fixtures/fires~ClassWithFires#event:event-non-existing',
				source: 'firesabsolute.ts:15'
			},
			{
				identifier: 'module:fixtures/fires~ClassWithFires#event:property',
				source: 'firesabsolute.ts:15'
			},
			{
				identifier: 'module:fixtures/fires~ClassWithFires#event:event-non-existing',
				source: 'firesabsolute.ts:21'
			},
			{
				identifier: 'module:fixtures/fires~ClassWithFires#event:property',
				source: 'firesabsolute.ts:21'
			}
		];

		expect( onErrorCallback.callCount ).to.equal( expectedErrors.length );

		for ( const error of expectedErrors ) {
			expect( onErrorCallback ).to.be.calledWith(
				`Event "${ error.identifier }" is not found.`,
				sinon.match( reflection => {
					const source = utils.getSource( reflection );

					return error.source === `${ source.fileName }:${ source.line }`;
				} )
			);
		}
	} );
} );
