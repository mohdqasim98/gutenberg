/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { NavigableMenu } from '../navigable-container';
import Button from '../button';
import type { TabButtonProps, TabPanelProps } from './types';
import type { WordPressComponentProps } from '../ui/context';
import { useControlledValue } from '../utils';

const TabButton = ( {
	tabId,
	children,
	selected,
	...rest
}: TabButtonProps ) => (
	<Button
		role="tab"
		tabIndex={ selected ? null : -1 }
		aria-selected={ selected }
		id={ tabId }
		__experimentalIsFocusable
		{ ...rest }
	>
		{ children }
	</Button>
);

/**
 * TabPanel is an ARIA-compliant tabpanel.
 *
 * TabPanels organize content across different screens, data sets, and interactions.
 * It has two sections: a list of tabs, and the view to show when tabs are chosen.
 *
 * ```jsx
 * import { TabPanel } from '@wordpress/components';
 *
 * const onSelect = ( tabName ) => {
 *   console.log( 'Selecting tab', tabName );
 * };
 *
 * const MyTabPanel = () => (
 *   <TabPanel
 *     className="my-tab-panel"
 *     activeClass="active-tab"
 *     onSelect={ onSelect }
 *     tabs={ [
 *       {
 *         name: 'tab1',
 *         title: 'Tab 1',
 *         className: 'tab-one',
 *       },
 *       {
 *         name: 'tab2',
 *         title: 'Tab 2',
 *         className: 'tab-two',
 *       },
 *     ] }
 *   >
 *     { ( tab ) => <p>{ tab.title }</p> }
 *   </TabPanel>
 * );
 * ```
 */
export function TabPanel( {
	className,
	children,
	tabs,
	selectOnMove = true,
	initialTabName,
	tabName: tabNameProp,
	orientation = 'horizontal',
	activeClass = 'is-active',
	onSelect,
}: WordPressComponentProps< TabPanelProps, 'div', false > ) {
	const instanceId = useInstanceId( TabPanel, 'tab-panel' );

	const getTab = ( name: string | undefined ) =>
		tabs.find( ( tab ) => tab.name === name && ! tab.disabled );
	const firstEnabledTab = tabs.find( ( { disabled } ) => ! disabled );

	const [ tabName, setTabName ] = useControlledValue( {
		defaultValue: ( getTab( initialTabName ) || firstEnabledTab )?.name,
		value: getTab( tabNameProp )?.name,
		onChange: onSelect,
	} );

	// Simulate a click on the newly focused tab, which causes the component
	// to show the `tab-panel` associated with the clicked tab.
	const activateTabAutomatically = (
		_childIndex: number,
		child: HTMLButtonElement
	) => {
		child.click();
	};
	const selectedTab = getTab( tabName ) || firstEnabledTab;
	const selectedId = `${ instanceId }-${ selectedTab?.name ?? 'none' }`;

	// useEffect( () => {
	// 	setTabName( selectedTab?.name );
	// }, [ selectedTab?.name ] );

	return (
		<div className={ className }>
			<NavigableMenu
				role="tablist"
				orientation={ orientation }
				onNavigate={
					selectOnMove ? activateTabAutomatically : undefined
				}
				className="components-tab-panel__tabs"
			>
				{ tabs.map( ( tab ) => (
					<TabButton
						className={ classnames(
							'components-tab-panel__tabs-item',
							tab.className,
							{
								[ activeClass ]: tab.name === selectedTab?.name,
							}
						) }
						tabId={ `${ instanceId }-${ tab.name }` }
						aria-controls={ `${ instanceId }-${ tab.name }-view` }
						selected={ tab.name === selectedTab?.name }
						key={ tab.name }
						onClick={ () => setTabName( tab.name ) }
						disabled={ tab.disabled }
						label={ tab.icon && tab.title }
						icon={ tab.icon }
						showTooltip={ !! tab.icon }
					>
						{ ! tab.icon && tab.title }
					</TabButton>
				) ) }
			</NavigableMenu>
			{ selectedTab && (
				<div
					key={ selectedId }
					aria-labelledby={ selectedId }
					role="tabpanel"
					id={ `${ selectedId }-view` }
					className="components-tab-panel__tab-content"
				>
					{ children( selectedTab ) }
				</div>
			) }
		</div>
	);
}

export default TabPanel;
