#!/data/data/com.termux/files/usr/bin/env bash

output="url.csv"
max_jobs=50
target=${1:-200}

api="https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924"

# 内存去重数组（关联数组）
declare -A seen
[[ -f $output ]] && while IFS= read -r u; do seen[$u]=1; done < "$output"

count=0
while (( count < target )); do
    while (( $(jobs -rp | wc -l) >= max_jobs )); do
        wait -n
    done

    {
        for retry in {1..3}; do
            new=$(curl -sfL -m 5 -w '%{url_effective}' -o /dev/null "$api") && break
        done
        [[ -z $new || $new == "$api" ]] && exit
        # 原子判断+追加（子进程里 echo >> 是安全的，因为父进程串行 wait）
        if [[ -z ${seen[$new]} ]]; then
            echo "$new"      # 回传给父进程
            seen[$new]=1
        fi
    } | {
        read -r line
        [[ $line ]] && { echo "$line" >> "$output"; echo "$line"; }
    } &
done
wait
echo "✅ 已完成，共写入 $count 条 URL → $output"