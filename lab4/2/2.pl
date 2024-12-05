#!/usr/bin/perl

use IO::Socket;


my $host = shift || "127.0.0.1";
my $port = 80;
my $path = "/";


sub make_request {
    my ($method, $path, $data) = @_;
    
    my $socket = IO::Socket::INET->new(
        PeerAddr => $host,
        PeerPort => $port,
        Proto    => "tcp",
    ) or die "Не удалось подключиться к серверу $host:$port : $!";
    
    my $request = "$method $path HTTP/1.1\r\n";
    $request .= "Host: $host\r\n";
    $request .= "Connection: close\r\n";
    if ($method eq "POST") {
        $request .= "Content-Type: application/x-www-form-urlencoded\r\n";
        $request .= "Content-Length: " . length($data) . "\r\n";
    }
    $request .= "\r\n";
    $request .= $data if $method eq "POST";
    
    print $socket $request;
    
    my ($headers, $body) = ("", "");
    my $is_body = 0;
    while (my $line = <$socket>) {
        if ($line =~ /^\s*$/ && !$is_body) {
            $is_body = 1;
            next;
        }
        $is_body ? ($body .= $line) : ($headers .= $line);
    }
    close($socket);
    
    open my $header_file, '>', "requests/${method}_headers.txt" or die "Не удалось создать файл: $!";
    print $header_file $headers;
    close $header_file;
    
    if ($method ne "HEAD") {
        open my $body_file, '>', "requests/${method}_body.html" or die "Не удалось создать файл: $!";
        print $body_file $body;
        close $body_file;
    }
    
    print "Запрос $method завершен. Заголовки сохранены в ${method}_headers.txt.\n";
    print "Тело ответа сохранено в requests/${method}_body.html.\n" if $method ne "HEAD";
}

make_request("GET", $path, "");
make_request("POST", $path, "param1=value1&param2=value2");
make_request("HEAD", $path, "");
