<?php

require_once "includes.php";

$wiki = $_GET[ 'wiki' ];

$creator = get_creator( $wiki );

if ( !can_delete( $creator ) ) {
	die( '<p>You are not allowed to delete this wiki.</p>' );
}

if ( !isset( $_POST['confirm' ] ) ) {

	$wikilist = [
		[
			'data' => '',
			'label' => 'None',
		]
	];
	$cache = load_wikicache();
	if ( $cache ) {
		$wikis = json_decode( $cache, true );
		foreach ( $wikis as $hash => $data ) {
			$wikilist[] = [
				'data' => $hash,
				'label' => $hash . ' - ' . $data['creator'] . ' (' . date( 'c', $data[ 'mtime' ] ) . ')',
			];
		}
	}
	echo new OOUI\FormLayout( [
		'method' => 'POST',
		'items' => [
			new OOUI\FieldsetLayout( [
				'label' => new OOUI\HtmlSnippet(
					'Are you sure you want to delete this wiki: <a href="wikis/' . $wiki . '/w">' . $wiki . '</a>?<br>' .
					'This cannot be undone.'
				),
				'items' => array_filter( [
					count( $wikilist ) > 1 ?
						new OOUI\FieldLayout(
							new OOUI\DropdownInputWidget( [
								'name' => 'redirect',
								'options' => $wikilist,
							] ),
							[
								'label' => 'Leave a redirect to this wiki:',
								'align' => 'left',
							]
						) :
						null,
					new OOUI\FieldLayout(
						new OOUI\ButtonInputWidget( [
							'type' => 'submit',
							'name' => 'confirm',
							'label' => 'Delete',
							'flags' => [ 'primary', 'destructive' ]
						] ),
						[
							'label' => ' ',
							'align' => 'left',
						]
					),
				] )
			] )
		]
	] );

} else {
	ob_implicit_flush( true );

	$error = delete_wiki( $wiki );
	if ( $error ) {
		echo( "Wiki not cleanly deleted, may have not been fully setup." );
	} else {
		echo "Wiki deleted.";
	}

	function isValidHash( $hash ) {
		return preg_match( '/^[0-9a-f]{32}$/', $hash );
	}

	$redirect = $_POST['redirect'] ?? null;

	if (
		$redirect &&
		isValidHash( $redirect ) &&
		isValidHash( $wiki )
	) {
		// TODO: Avoid duplication in redirect file
		file_put_contents(
			'redirects.txt',
			$wiki . ' ' . $redirect . "\n",
			FILE_APPEND | LOCK_EX
		);
		echo ' Redirected to <a href="wikis/' . $redirect . '/w">' . $redirect . '</a>.';
	}
}
