#!/bin/bash

# 前端测试运行脚本
# 用法: ./run-tests.sh [选项]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认选项
COVERAGE=false
WATCH=false
VERBOSE=false
SPECIFIC_TEST=""
BAIL=false

# 帮助信息
show_help() {
    echo "前端测试运行脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -c, --coverage          生成覆盖率报告"
    echo "  -w, --watch             监听模式运行测试"
    echo "  -v, --verbose           详细输出"
    echo "  -t, --test <pattern>    运行特定测试文件"
    echo "  -b, --bail              遇到第一个失败就停止"
    echo "  --install               安装测试依赖"
    echo "  --clean                 清理测试缓存"
    echo ""
    echo "示例:"
    echo "  $0                      运行所有测试"
    echo "  $0 -c                   运行测试并生成覆盖率报告"  
    echo "  $0 -w                   监听模式运行测试"
    echo "  $0 -t utils             只运行 utils 相关测试"
    echo "  $0 --install            安装测试依赖"
}

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查测试依赖..."
    
    if [ ! -d "node_modules" ]; then
        log_warning "未找到 node_modules 目录"
        log_info "正在安装依赖..."
        npm install
    fi
    
    # 检查必要的包
    local required_packages=("jest" "miniprogram-simulate" "@babel/core" "@babel/preset-env")
    for package in "${required_packages[@]}"; do
        if ! npm list "$package" > /dev/null 2>&1; then
            log_error "缺少依赖包: $package"
            log_info "请运行: npm install"
            exit 1
        fi
    done
    
    log_success "依赖检查完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装测试依赖..."
    
    if [ -f "package.json" ]; then
        npm install
        log_success "依赖安装完成"
    else
        log_error "未找到 package.json 文件"
        exit 1
    fi
}

# 清理缓存
clean_cache() {
    log_info "清理测试缓存..."
    
    # 清理 Jest 缓存
    if command -v npx > /dev/null; then
        npx jest --clearCache
    fi
    
    # 清理覆盖率报告
    if [ -d "coverage" ]; then
        rm -rf coverage
        log_info "已清理覆盖率报告"
    fi
    
    # 清理临时文件
    find . -name "*.tmp" -delete 2>/dev/null || true
    
    log_success "缓存清理完成"
}

# 构建测试命令
build_test_command() {
    local cmd="npm test"
    
    # 添加选项
    if [ "$COVERAGE" = true ]; then
        cmd="npm run test:coverage"
    elif [ "$WATCH" = true ]; then
        cmd="npm run test:watch"
    fi
    
    # Jest 参数
    local jest_args=""
    
    if [ "$VERBOSE" = true ]; then
        jest_args="$jest_args --verbose"
    fi
    
    if [ "$BAIL" = true ]; then
        jest_args="$jest_args --bail"
    fi
    
    if [ -n "$SPECIFIC_TEST" ]; then
        jest_args="$jest_args --testPathPattern=$SPECIFIC_TEST"
    fi
    
    if [ -n "$jest_args" ]; then
        cmd="$cmd -- $jest_args"
    fi
    
    echo "$cmd"
}

# 运行测试
run_tests() {
    log_info "开始运行测试..."
    
    local test_cmd=$(build_test_command)
    log_info "执行命令: $test_cmd"
    
    # 运行测试
    if eval "$test_cmd"; then
        log_success "测试运行完成"
        
        # 如果生成了覆盖率报告，显示路径
        if [ "$COVERAGE" = true ] && [ -d "coverage" ]; then
            log_info "覆盖率报告生成完成:"
            log_info "  HTML 报告: coverage/lcov-report/index.html"
            log_info "  文本报告: coverage/lcov.info"
        fi
        
        return 0
    else
        log_error "测试运行失败"
        return 1
    fi
}

# 显示测试统计
show_test_stats() {
    if [ -f "coverage/coverage-summary.json" ]; then
        log_info "测试覆盖率统计:"
        
        # 使用 node 解析 JSON（如果可用）
        if command -v node > /dev/null; then
            node -e "
                const fs = require('fs');
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                const total = coverage.total;
                console.log('  行覆盖率: ' + total.lines.pct + '%');
                console.log('  函数覆盖率: ' + total.functions.pct + '%'); 
                console.log('  分支覆盖率: ' + total.branches.pct + '%');
                console.log('  语句覆盖率: ' + total.statements.pct + '%');
            "
        fi
    fi
}

# 主函数
main() {
    # 确保在正确的目录中
    if [ ! -f "package.json" ]; then
        log_error "请在包含 package.json 的目录中运行此脚本"
        exit 1
    fi
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--coverage)
                COVERAGE=true
                shift
                ;;
            -w|--watch)
                WATCH=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -t|--test)
                SPECIFIC_TEST="$2"
                shift 2
                ;;
            -b|--bail)
                BAIL=true
                shift
                ;;
            --install)
                install_dependencies
                exit 0
                ;;
            --clean)
                clean_cache
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查依赖
    check_dependencies
    
    # 运行测试
    if run_tests; then
        show_test_stats
        log_success "所有操作完成"
        exit 0
    else
        log_error "测试运行失败"
        exit 1
    fi
}

# 运行主函数
main "$@"
