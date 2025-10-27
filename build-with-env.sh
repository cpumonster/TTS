#!/bin/bash
# 환경 변수 확인 후 빌드 스크립트

echo "🔍 환경 변수 확인 중..."

if [ ! -f .env.local ]; then
    echo "❌ .env.local 파일이 없습니다!"
    exit 1
fi

# API 키가 설정되어 있는지 확인
if ! grep -q "GEMINI_API_KEY=.*[A-Za-z0-9]" .env.local; then
    echo "❌ GEMINI_API_KEY가 설정되지 않았습니다!"
    exit 1
fi

echo "✅ 환경 변수 확인 완료"
echo ""
echo "🏗️  빌드 시작..."

# 빌드 실행
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 빌드 성공!"
    echo ""
    echo "📦 배포 파일 압축 중..."
    
    # 기존 zip 삭제
    rm -f TTS-build.zip
    
    # .htaccess와 _redirects 추가
    cat > dist/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
EOF

    echo "/*    /index.html   200" > dist/_redirects
    
    # ZIP 파일 생성
    zip -r TTS-build.zip dist/
    
    echo ""
    echo "✅ 배포 파일 준비 완료: TTS-build.zip"
    echo ""
    echo "📊 빌드 결과:"
    ls -lh dist/
    echo ""
    echo "🚀 네임칩에 업로드할 파일: TTS-build.zip ($(ls -lh TTS-build.zip | awk '{print $5}'))"
else
    echo ""
    echo "❌ 빌드 실패!"
    exit 1
fi

