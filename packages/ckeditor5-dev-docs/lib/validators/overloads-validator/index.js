/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { ReflectionKind } = require( 'typedoc' );
const { getSource, isReflectionValid } = require( '../utils' );

/**
 * Validates the CKEditor 5 documentation.
 *
 * @param {Object} project Generated output from TypeDoc to validate.
 * @param {Function} onError Called if validation error is detected.
 */
module.exports = function validate( project, onError ) {
	const reflections = project.getReflectionsByKind( ReflectionKind.Method | ReflectionKind.Function ).filter( isReflectionValid );

	for ( const reflection of reflections ) {
		if ( reflection.signatures.length === 1 ) {
			continue;
		}

		for ( const signature of reflection.signatures ) {
			if ( signature.comment && signature.comment.getTag( '@label' ) ) {
				continue;
			}

			onError( 'Missing "@label" tag for overloaded signature', getSource( signature ) );
		}
	}
};
