/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const mockery = require( 'mockery' );
const { expect } = require( 'chai' );
const sinon = require( 'sinon' );

describe( 'removeDir', () => {
	let sandbox, removeDir;
	const logMessages = [];
	const deletedPaths = [];

	before( () => {
		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		mockery.registerMock( '@ckeditor/ckeditor5-dev-utils', {
			logger: () => ( {
				info( message ) {
					logMessages.push( message );
				}
			} )
		} );

		mockery.registerMock( 'del', path => {
			return Promise.resolve().then( () => {
				deletedPaths.push( path );
			} );
		} );

		mockery.registerMock( 'chalk', {
			cyan: message => `\u001b[36m${ message }\u001b[39m`
		} );

		removeDir = require( '../../../lib/utils/manual-tests/removedir' );
		sandbox = sinon.createSandbox();
	} );

	after( () => {
		mockery.disable();
		mockery.deregisterAll();
	} );

	afterEach( () => {
		sandbox.restore();
		logMessages.length = 0;
		deletedPaths.length = 0;
	} );

	it( 'should remove directory and log it', () => {
		return removeDir( 'workspace/directory' ).then( () => {
			expect( logMessages ).to.deep.equal( [
				'Removed directory \'\u001b[36mworkspace/directory\u001b[39m\''
			] );

			expect( deletedPaths ).to.deep.equal( [
				'workspace/directory'
			] );
		} );
	} );

	it( 'should remove directory and does not inform about it', () => {
		return removeDir( 'workspace/directory', { silent: true } ).then( () => {
			expect( logMessages ).to.deep.equal( [] );

			expect( deletedPaths ).to.deep.equal( [
				'workspace/directory'
			] );
		} );
	} );
} );
