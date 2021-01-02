<?php
header( 'HTTP/1.0 404 Not Found' );
require_once "includes.php";

// Check for redirect
$redirects = get_if_file_exists( 'redirects.txt' );
$redirect = false;
if ( $redirects ) {
	$uri = $_SERVER['REQUEST_URI'];
	$lines = explode( "\n", $redirects );
	foreach ( $lines as $line ) {
		if ( !$line ) {
			continue;
		}
		$parts = explode( ' ', $line );
		if ( strpos( $uri, $parts[0] ) !== false ) {
			$uri = str_replace( $parts[0], $parts[1], $uri );
			$redirect = true;
		}
	}
}

if ( $redirect ) {
	echo new \OOUI\MessageWidget( [
		'type' => 'info',
		'icon' => 'articleRedirect',
		'label' => new \OOUI\HtmlSnippet(
			'This wiki has been deleted. The following wiki was selected as a direct replacement: ' .
			'<a href="' . htmlspecialchars( $uri ) . '">' . $uri . '</a>'
		)
	] );
} else {
	echo new \OOUI\MessageWidget( [
		'type' => 'error',
		'label' => 'Page not found. The wiki you are looking for may have been deleted.'
	] );
}

include "footer.html";
