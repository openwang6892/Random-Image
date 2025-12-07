<?php
const ALLOW_RAW_OUTPUT = true;
// 是否开启 ?raw 选项，可能会消耗服务器较多流量

function has_query($query)
{
    return isset($_GET[$query]);
}

if (file_exists(__DIR__ . '/url.csv')) // in the same folder
    $imgs_array = file(__DIR__ . '/url.csv', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
else if (file_exists('../url.csv'))    // in the parent folder
    $imgs_array = file('../url.csv', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
else                                   // for vercel runtime
    $imgs_array = file('http://' . $_SERVER['HTTP_HOST'] . '/url.csv', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if (count($imgs_array) == 0) $imgs_array = array('https://http.cat/503');


$id = has_query('id') ? $_GET['id'] : "";
if (strlen($id) > 0 && is_numeric($id) && $id >= 0) {
    settype($id, 'int');
    $len = count($imgs_array);
    if ($id >= $len) {
        $id = array_rand($imgs_array);
    } else {
        header('Cache-Control: public, max-age=86400');
    }
} else {
    header('Cache-Control: no-cache');
    $id = array_rand($imgs_array);
}


if (has_query('json')) {
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    echo json_encode(array('id' => $id, 'url' => $imgs_array[$id]));
} else if (has_query('raw')) {
    if (!ALLOW_RAW_OUTPUT) {
        header('HTTP/1.1 403 Forbidden');
        exit();
    }
    // 获取图片内容并输出
    $image_content = file_get_contents($imgs_array[$id]);
    if ($image_content !== false) {
        // 尝试检测内容类型，否则默认为image/png
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_buffer($finfo, $image_content);
        finfo_close($finfo);
        header('Content-Type: ' . $mime_type);
        echo $image_content;
    } else {
        header('HTTP/1.1 404 Not Found');
        exit();
    }
} else {
    header('Referrer-Policy: no-referrer');
    header('Location: ' . $imgs_array[$id]);
}

exit();
