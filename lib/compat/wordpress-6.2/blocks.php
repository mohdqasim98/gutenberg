<?php
/**
 * Temporary compatibility shims for block APIs present in Gutenberg.
 *
 * @package gutenberg
 */

/**
 * Update allowed inline style attributes list.
 *
 * Note: This should be removed when the minimum required WP version is >= 6.2.
 *
 * @param string[] $attrs Array of allowed CSS attributes.
 * @return string[] CSS attributes.
 */
function gutenberg_safe_style_attrs_6_2( $attrs ) {
	$attrs[] = 'position';
	$attrs[] = 'top';
	$attrs[] = 'right';
	$attrs[] = 'bottom';
	$attrs[] = 'left';
	$attrs[] = 'z-index';

	return $attrs;
}
add_filter( 'safe_style_css', 'gutenberg_safe_style_attrs_6_2' );

/**
 * Ensure the selectors property, set via block.json metadata, is included
 * within the block type's settings.
 *
 * Note: This should be removed when the minimum required WP version is >= 6.2.
 *
 * @see https://github.com/WordPress/gutenberg/pull/46496
 *
 * @param array $settings Current block type settings.
 * @param array $metadata Block metadata as read in via block.json.
 *
 * @return array Filtered block type settings.
 */
function gutenberg_add_selectors_to_block_type_settings( $settings, $metadata ) {
	if ( ! isset( $settings['selectors'] ) && isset( $metadata['selectors'] ) ) {
		$settings['selectors'] = $metadata['selectors'];
	}

	return $settings;
}
add_filter( 'block_type_metadata_settings', 'gutenberg_add_selectors_to_block_type_settings', 10, 2 );
