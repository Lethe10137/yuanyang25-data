import os
import json
from typing import Any, Dict

def process_json(json_obj, base_path):
    """
    递归地处理JSON对象，如果有{"file": path}，将其替换为文件内容。
    :param json_obj: 当前处理的JSON对象
    :param base_path: info.json文件所在的文件夹路径
    :return: 处理后的JSON对象
    """
    if isinstance(json_obj, dict):
        for key, value in json_obj.items():
            if key == "file" and isinstance(value, str):
                file_path = os.path.join(base_path, value)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        return f.read()
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
            else:
                json_obj[key] = process_json(value, base_path)
    elif isinstance(json_obj, list):
        for i in range(len(json_obj)):
            json_obj[i] = process_json(json_obj[i], base_path)
    return json_obj

def check(input: Dict) -> Dict:
    ans = {}
    ans["puzzle_id"] = int(input["puzzle_id"])
    ans["title"] = str(input["title"])
    ans["meta"] = input["meta"]
    ans["price"] = input["price"]

    ans["content"] = [[None, str(input["init"]), {}]]
    
    for (submit, response, zero_punish) in input["step"]:
        zero_punishes = {}
        
        for key in zero_punish:
            zero_punishes[str(key)] = str(zero_punish[str(key)])
        step = [str(submit), str(response), zero_punishes]
        ans["content"].append(step)
        
        
    ans ["hints"] = []
    
    for item in input["hints"]:
        ans["hints"].append({
            "title": str(item["title"]),
            "content": str(item["content"]),
            "price": int(item["price"]),
        })

    return ans


def main():
    puzzle_base_path = "./puzzle_files"
    
    data = []
    
    for folder_name in os.listdir(puzzle_base_path):
        folder_path = os.path.join(puzzle_base_path, folder_name)

        if os.path.isdir(folder_path):
            info_path = os.path.join(folder_path, "info.json")

            if os.path.exists(info_path):
                try:
                    with open(info_path, "r", encoding="utf-8") as f:
                        json_data = json.load(f)

                    # 记录 puzzle_id
                    puzzle_id = int(folder_name)
                    json_data: dict[Any, Any] = process_json(json_data, folder_path) # type: ignore

                    # 添加 puzzle_id 字段
                    json_data["puzzle_id"] = puzzle_id
                    
                    checked_data = check(json_data)

                    data.append(checked_data)

                except Exception as e:
                    print(f"Error processing {info_path}: {e}")
    
    return data


if __name__ == "__main__":
    data = main()
    
    json.dump(data, open("raw_puzzles.json", "w"), indent=4, ensure_ascii=False)
