/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const { expect } = require( 'chai' );
const sinon = require( 'sinon' );
const mockery = require( 'mockery' );
const utils = require( '../../utils' );

describe( 'dev-docs/validators/fires-validator', function() {
	this.timeout( 10 * 1000 );

	const FIXTURES_PATH = utils.normalizePath( __dirname, 'fixtures' );
	const SOURCE_FILES = utils.normalizePath( FIXTURES_PATH, '**', '*.ts' );
	const TSCONFIG_PATH = utils.normalizePath( FIXTURES_PATH, 'tsconfig.json' );
	const OUTPUT_PATH = utils.normalizePath( FIXTURES_PATH, 'output.json' );

	let sandbox, stubs;

	before( async () => {
		sandbox = sinon.createSandbox();

		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		stubs = {
			logger: {
				info: sandbox.stub(),
				warning: sandbox.stub(),
				error: sandbox.stub()
			}
		};

		mockery.registerMock( '@ckeditor/ckeditor5-dev-utils', {
			logger: sandbox.stub().callsFake( () => stubs.logger )
		} );

		const { build } = require( '../../../lib' );

		await build( {
			cwd: FIXTURES_PATH,
			tsconfig: TSCONFIG_PATH,
			sourceFiles: [ SOURCE_FILES ],
			outputPath: OUTPUT_PATH,
			validateOnly: false,
			strict: false
		} );
	} );

	after( () => {
		sandbox.restore();
		mockery.disable();
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

		expect( stubs.logger.warning.callCount ).to.equal( expectedErrors.length );

		for ( const error of expectedErrors ) {
			expect( stubs.logger.warning ).to.be.calledWith( `Event "${ error.identifier }" is not found (${ error.source }).` );
		}
	} );
} );
