/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { toggleFormat, remove, applyFormat } from '@wordpress/rich-text';
import {
	RichTextToolbarButton,
	RichTextShortcut,
} from '@wordpress/block-editor';
import { code as codeIcon } from '@wordpress/icons';

/** @typedef {import('@wordpress/rich-text/src/create.js').RichTextValue} RichTextValue */

const name = 'core/code';
const title = __( 'Inline code' );

export const code = {
	name,
	title,
	tagName: 'code',
	className: null,

	/**
	 * Scan backwards in the RichTextValue starting at the selection
	 * to find just-closed inline code regions, and format them.
	 *
	 * Example:
	 *     Models ending in `-J3 were built last year.
	 *                          ^ started with the selection here.
	 *     Models ending in `-J3` were built last year.
	 *                           ^ inserting the ` nudged forward the selection.
	 *     Models ending in `-J3` were built last year.
	 *                      ^ we want to scan backwards to find this one.
	 *     Models ending in `-J3` were built last year.
	 *                         ³²¹
	 *                              1. This is `start` when entering this function.
	 *                              2. We only consider a search if `start - 1` is a backtick.
	 *                              3. Any matching backtick must be at `start - 2` or earlier.
	 *                              4. Obviously no match can exist before `0`.
	 *
	 * Once we identify a now-closed inline code region we want to remove
	 * the backtick markers and apply the format to that inner region.
	 *
	 * @param {RichTextValue} value Value to adjust, with possible inline code regions surrounded by backticks.
	 * @return {RichTextValue} Unmodified value if no inline code region found, else new value with region formatted and without backticks.
	 */
	__unstableInputRule( value ) {
		const BACKTICK = '`';
		const { start, text } = value;

		if (
			undefined === start ||
			start - 2 < 0 ||
			text[ start - 1 ] !== BACKTICK
		) {
			return value;
		}

		const closerAt = start - 1;
		const openerAt = text.lastIndexOf( BACKTICK, closerAt - 1 );
		if ( openerAt === -1 ) {
			return value;
		}

		// Ignore double-backticks if we find them. Note that if we later
		// find a third one, it will steal the closer we just passed.
		//
		// Example:
		//     Not inline code: ``.
		//                       ^ ignore this because the opening backtick
		//                         is the immediate predecessor to the closer
		//     Not inline code: ``. A third traps it.
		//     Not inline code: ``. A third `traps it.
		//                                  ^ upon entering this ` we close the span.
		//     Not inline code: `{. A third }traps it.
		//                       ^^^^^^^^^^^^ and we've "stolen" the previous backtick,
		//                                    formatting this long span as inline code.
		//
		// To eliminate this we can perform a third check to see if the immediate
		// predecessor to the opening backtick is also a backtick and then ignore it.
		//
		// This also happens over long spans, such as when we manually undo an inline
		// code format that was auto-applied, but later start a new one. There's no easy
		// way to determine if we should steal the earlier backtick and format the lengthy
		// region automatically. We might consider scanning all the way to the beginning
		// to determine if there are already a balanced set (even count) of backticks, or
		// compare the candidate span's length to some heuristic threshold.
		//
		// Example:
		//     This `region` was manually entered as textual backticks. This steals the content.
		//                                                                   ^
		//     This `region` was manually entered as textual backticks. This `steals the content.
		//                                                                    ^ we've entered a new backtick
		//     This `region{ was manually entered as textual backticks. This }steals the content.
		//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ and have "stolen" the previous chunk.
		if ( openerAt === closerAt - 1 ) {
			return value;
		}

		value = remove( value, openerAt, openerAt + 1 );
		value = remove( value, closerAt - 1, closerAt );
		value = applyFormat( value, { type: name }, openerAt, closerAt );

		return value;
	},
	edit( { value, onChange, onFocus, isActive } ) {
		function onClick() {
			onChange( toggleFormat( value, { type: name, title } ) );
			onFocus();
		}

		return (
			<>
				<RichTextShortcut
					type="access"
					character="x"
					onUse={ onClick }
				/>
				<RichTextToolbarButton
					icon={ codeIcon }
					title={ title }
					onClick={ onClick }
					isActive={ isActive }
					role="menuitemcheckbox"
				/>
			</>
		);
	},
};
