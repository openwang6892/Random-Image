#!/usr/bin/env bash
output=url.csv
max_jobs=50
i=1

entries=(
  "https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924"
)
entry_count=${#entries[@]}

trap 'clear; wait; exit 0' INT TERM

# 原子去重追加（静默）
append(){
    awk -v line="$1" '
    BEGIN {found=0}
    line==$0 {found=1; exit}
    END   {if(!found) print line >> "'"$output"'"}' "$output" 2>/dev/null
}

while true; do
    while (( $(jobs -r | wc -l) >= max_jobs )); do
        wait -n
    done

    {
        pick_url=${entries[$RANDOM % entry_count]}
        new_url=$(curl -sfL -w '%{url_effective}\n' -o /dev/null -G "$pick_url")
        [[ -z $new_url || $new_url == "$pick_url" ]] && exit 0
        append "$new_url" || exit 0          # 去重失败说明已存在
        echo "新写入第${i}条: $new_url"      # 序号在主进程打印
        ((i++))
    } &
done
