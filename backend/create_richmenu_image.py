#!/usr/bin/env python3
"""
LINEリッチメニュー用の画像を生成するスクリプト
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_richmenu_image():
    # 画像サイズ (2500x1686)
    width = 2500
    height = 1686
    
    # 新しい画像を作成
    richmenu_img = Image.new('RGB', (width, height), color='#ffffff')
    
    try:
        # 左側用の画像（デジタルID）を読み込み
        digital_id_img = Image.open('assets/digital_id.png')
        
        # 右側用の画像（デジタル証明書）を読み込み
        digital_vc_img = Image.open('assets/digital_vc.png')
        
        # 左側エリアのサイズ（幅の半分）
        left_width = width // 2
        
        # 画像をリサイズして左側に配置
        # アスペクト比を保持しながらリサイズ
        digital_id_resized = resize_image_to_fit(digital_id_img, left_width, height)
        
        # 左側の中央に配置
        left_x = (left_width - digital_id_resized.width) // 2
        left_y = (height - digital_id_resized.height) // 2
        richmenu_img.paste(digital_id_resized, (left_x, left_y))
        
        # 画像をリサイズして右側に配置
        digital_vc_resized = resize_image_to_fit(digital_vc_img, left_width, height)
        
        # 右側の中央に配置
        right_x = left_width + (left_width - digital_vc_resized.width) // 2
        right_y = (height - digital_vc_resized.height) // 2
        richmenu_img.paste(digital_vc_resized, (right_x, right_y))
        
        # 中央に分割線を描画
        draw = ImageDraw.Draw(richmenu_img)
        draw.line([(left_width, 0), (left_width, height)], fill='#cccccc', width=4)
        
        print("既存の画像を使用してリッチメニューを作成しました")
        
    except Exception as e:
        print(f"画像の読み込みに失敗しました: {e}")
        print("シンプルなリッチメニューを作成します...")
        
        # 画像が読み込めない場合は、シンプルなメニューを作成
        draw = ImageDraw.Draw(richmenu_img)
        
        # 背景色を設定
        richmenu_img = Image.new('RGB', (width, height), color='#f0f0f0')
        draw = ImageDraw.Draw(richmenu_img)
        
        # 左右に分割する線を描画
        line_x = width // 2
        draw.line([(line_x, 0), (line_x, height)], fill='#cccccc', width=8)
        
        # 左側（デジタルID）の背景
        draw.rectangle([20, 20, line_x - 20, height - 20], fill='#4a90e2')
        
        # 右側（デジタル証明書）の背景
        draw.rectangle([line_x + 20, 20, width - 20, height - 20], fill='#50c878')
        
        # テキストを追加
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        except:
            font_large = ImageFont.load_default()
        
        # 左側のテキスト
        left_center_x = line_x // 2
        left_center_y = height // 2
        draw.text((left_center_x - 100, left_center_y), "デジタルID", fill='white', font=font_large)
        
        # 右側のテキスト
        right_center_x = line_x + (width - line_x) // 2
        right_center_y = height // 2
        draw.text((right_center_x - 120, right_center_y), "デジタル証明書", fill='white', font=font_large)
    
    # 画像を保存
    output_path = 'assets/richmenu-digital-services.png'
    richmenu_img.save(output_path, 'PNG', quality=95)
    print(f"リッチメニュー画像を生成しました: {output_path}")
    print(f"画像サイズ: {width}x{height}")
    
    return output_path

def resize_image_to_fit(img, max_width, max_height):
    """
    画像をアスペクト比を保持しながら指定されたサイズに収まるようにリサイズ
    """
    # 元の画像サイズ
    original_width, original_height = img.size
    
    # スケール比を計算
    scale_width = max_width / original_width
    scale_height = max_height / original_height
    scale = min(scale_width, scale_height)
    
    # 新しいサイズを計算
    new_width = int(original_width * scale)
    new_height = int(original_height * scale)
    
    # リサイズして返す
    return img.resize((new_width, new_height), Image.LANCZOS)

if __name__ == "__main__":
    create_richmenu_image() 