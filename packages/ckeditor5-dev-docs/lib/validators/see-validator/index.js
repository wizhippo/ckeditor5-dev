/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { ReflectionKind } = require( 'typedoc' );
const { getSource, isReflectionValid, isLinkValid } = require( '../utils' );

/**
 * Validates the CKEditor 5 documentation.
 *
 * @param {Object} project Generated output from TypeDoc to validate.
 * @param {Function} onError Called if validation error is detected.
 */
module.exports = function validate( project, onError ) {
	const reflections = project.getReflectionsByKind( ReflectionKind.Class | ReflectionKind.Method ).filter( isReflectionValid );

	for ( const reflection of reflections ) {
		const links = getRelatedLinks( reflection );

		if ( !links.length ) {
			continue;
		}

		for ( const link of links ) {
			const isValid = isLinkValid( project, reflection, link );

			if ( !isValid ) {
				onError( `Target doclet for "${ link }" link is not found`, getSource( reflection ) );
			}
		}
	}
};

function getRelatedLinks( reflection ) {
	if ( !reflection.comment ) {
		return [];
	}

	return reflection.comment.getTags( '@see' )
		.flatMap( tag => tag.content.map( item => item.text.trim() ) )
		.filter( text => {
			// Remove list markers (e.g. "-").
			if ( text.length <= 1 ) {
				return false;
			}

			// Remove external links.
			if ( /^https?:\/\//.test( text ) ) {
				return false;
			}

			return true;
		} );
}
