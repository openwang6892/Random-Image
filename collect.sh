file=url.csv
url="https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924"
trap 'wait' INT

i=1
while true; do
    curl -sLo /dev/null -w '%{url_effective}\n' -G $url >> $file &
    echo "新写入第$i条"
    sleep 0.01
    ((i++))
done