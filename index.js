/* global OO, $ */
( function () {
	var myWikis, closedWikis, branchSelect, form, submit, showClosed,
		presetInput, reposField, reposInput, reposFieldLabel,
		notifField, notifToggle,
		$wikisTable = $( '.wikis' );

	function updateTableClasses() {
		$wikisTable.toggleClass( 'hideOthers', !!myWikis.isSelected() );
		$wikisTable.toggleClass( 'hideOpen', !!closedWikis.isSelected() );
	}

	form = document.getElementById( 'new-form' );
	if ( form ) {
		submit = OO.ui.infuse( $( '.form-submit' ) );
		form.addEventListener( 'submit', function () {
			submit.setDisabled( true );
			return false;
		} );

		myWikis = OO.ui.infuse( $( '.myWikis' ) );
		myWikis.on( 'change', updateTableClasses );

		closedWikis = OO.ui.infuse( $( '.closedWikis' ) );
		closedWikis.on( 'change', updateTableClasses );

		if ( $( '.showClosed' ).length ) {
			showClosed = OO.ui.infuse( $( '.showClosed' ) );
			showClosed.on( 'click', function () {
				myWikis.setSelected( true );
				closedWikis.setSelected( true );
				updateTableClasses();
			} );
		}

		branchSelect = OO.ui.infuse( $( '.form-branch' ) );
		branchSelect.on( 'change', function () {
			var branch, repo, validBranch;
			branch = branchSelect.value;
			for ( repo in window.repoBranches ) {
				validBranch = window.repoBranches[ repo ].indexOf( branch ) !== -1;
				reposInput.checkboxMultiselectWidget
					.findItemFromData( repo )
					.setDisabled( !validBranch || repo === 'mediawiki/core' );
			}
			reposInput.emit( 'change' );
		} );

		presetInput = OO.ui.infuse( $( '.form-preset' ) );
		reposInput = OO.ui.infuse( $( '.form-repos' ) );
		reposField = OO.ui.infuse( $( '.form-repos-field' ) );

		reposFieldLabel = reposField.getLabel();

		presetInput.on( 'change', OO.ui.debounce( function () {
			var val = presetInput.getValue();
			if ( val === 'custom' ) {
				reposField.$body[ 0 ].open = true;
			}
			if ( val !== 'custom' ) {
				reposInput.setValue( window.presets[ val ] );
			}
		} ) );
		reposInput.on( 'change', OO.ui.debounce( function () {
			var selected = 0, enabled = 0,
				val, presetName, matchingPresetName;

			val = reposInput.getValue();
			matchingPresetName = 'custom';
			for ( presetName in window.presets ) {
				if ( window.presets[ presetName ].sort().join( '|' ) === val.sort().join( '|' ) ) {
					matchingPresetName = presetName;
					break;
				}
			}
			if ( presetInput.getValue() !== matchingPresetName ) {
				presetInput.setValue( matchingPresetName );
			}

			reposInput.checkboxMultiselectWidget.items.forEach( function ( option ) {
				if ( !option.isDisabled() ) {
					enabled++;
					if ( option.isSelected() ) {
						selected++;
					}
				}
			} );

			reposField.setLabel( reposFieldLabel + ' (' + selected + '/' + enabled + ')' );
		} ) );

		reposInput.emit( 'change' );

		if ( 'Notification' in window ) {
			notifField = OO.ui.infuse( document.getElementsByClassName( 'enableNotifications' )[ 0 ] );
			// Enable placholder widget so field label isn't greyed out
			notifField.fieldWidget.setDisabled( false );
			notifField.toggle( Notification.permission !== 'denied' );

			notifToggle = new OO.ui.ToggleButtonWidget( {
				icon: 'bellOutline'
			} )
				.on( 'change', function () {
					Notification.requestPermission().then( function ( permission ) {
						notifToggle.setValue( permission === 'granted' );
						if ( permission === 'granted' ) {
							notifField.setLabel( 'You will get a browser notification when your wikis are ready' );
						}
						if ( permission === 'denied' ) {
							notifField.toggle( false );
						}
					} );
				} )
				.setValue( Notification.permission === 'granted' );

			notifField.$field.empty().append( notifToggle.$element );
		}

	}

}() );
