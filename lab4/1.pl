#!/usr/bin/perl

use IO::Socket::INET;

my $host = shift || '127.0.0.1';
my $port = 80;
my $resource = shift || '*';

my $socket = IO::Socket::INET->new(
    PeerAddr => $host,
    PeerPort => $port,
    Proto    => 'tcp',
) or die "Не удалось подключиться к серверу: $!\n";

my $request = "OPTIONS $resource HTTP/1.1\r\n".
              "Host: $host\r\n".
              "Connection: close\r\n\r\n";

print $socket $request;

my $response = '';
while (my $line = <$socket>) {
    $response .= $line;
}

close $socket;

print "Ответ сервера:\n$response\n";

