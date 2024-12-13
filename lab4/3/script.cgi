#!/usr/bin/perl

print "Content-Type: text/html; charset=utf-8\n\n";

my $res = "";
foreach my $var (sort keys %ENV) {
    my $val = $ENV{$var};
    $val =~ s|\n|\\n|g;
    $val =~ s|"|\\"|g;
    $res .= "<tr><td>${var}</td><td>${val}</td></tr>\n";
}

print <<WEB_PAGE;
<!DOCTYPE html>
<html>
<head> <meta charset="UTF-8">
    <title>Переменные окружения</title>
</head> 
    <body>
        <table border='1'>
            <thead><tr><th>Переменная</th><th>Значение</th></tr></thead>
            <tbody>$res</tbody>
        </table>
    </body>
</html>
WEB_PAGE