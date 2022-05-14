#!/usr/bin/env node

import os from "os";
import path from "path";

import commandLineArgs, { OptionDefinition } from "command-line-args";

import { save_text_to_utf8_file, save_text_to_utf8_with_bom_file } from "./utils";
import { AuthorInfo, load_author_info, DEFAULT_AUTHOR_INFO } from "./author";

const TAB: string = "    ";

export function create_h_filename(class_name: string): string {
  return `Gap${class_name}.h`;
}

function create_cpp_filename(class_name: string): string {
  return `Gap${class_name}.cpp`;
}

function create_ui_filename(class_name: string): string {
  return `Gap${class_name}.ui`;
}

export function create_ui_h_filename(class_name: string): string {
  return `ui_Gap${class_name}.h`;
}

function generate_include_line(header: string): string {
  return `#include "${header}"`;
}

interface TextCreator {
  create(): string;
}

interface MethodConfig {
  default_constructor: boolean;
  copy_constructor: boolean;
  move_constructor: boolean;
  copy_assignment_operator: boolean;
  move_assignment_operator: boolean;
  destructor: boolean;
  [key: string]: boolean;
}

function create_default_method_configuration(): MethodConfig {
  return {
    default_constructor: true,
    copy_constructor: true,
    move_constructor: true,
    copy_assignment_operator: true,
    move_assignment_operator: true,
    destructor: true,
  };
}

class SourceFileCreator implements TextCreator {
  public author_info: AuthorInfo;
  public includes: string[];
  public namespace: string;
  public class_name: string;
  public method_config: MethodConfig;

  constructor(class_name: string, includes: string[] = []) {
    this.author_info = DEFAULT_AUTHOR_INFO;
    this.includes = includes;
    this.namespace = "";
    this.class_name = class_name;
    this.method_config = create_default_method_configuration();
  }

  generate_include_lines(): string {
    let include_lines = this.includes.map((incl) => {
      return generate_include_line(incl);
    });
    return include_lines.join(os.EOL);
  }

  create(): string {
    return `// Owner: ${this.author_info.owner}
// Co-Owner: ${this.author_info.co_owner}`;
  }
}

export class HFileCreator extends SourceFileCreator {
  constructor(class_name: string) {
    super(class_name);
  }

  generate_default_constructor(): string {
    return `${TAB}${TAB}${this.class_name}();`;
  }

  generate_copy_constructor(): string {
    return `${TAB}${TAB}${this.class_name}(const ${this.class_name}& other);`;
  }

  generate_move_constructor(): string {
    return `${TAB}${TAB}${this.class_name}(${this.class_name}&& other);`;
  }

  generate_copy_assignment_operator(): string {
    return `${TAB}${TAB}${this.class_name}& operator=(const ${this.class_name}& other);`;
  }

  generate_move_assignment_operator(): string {
    return `${TAB}${TAB}${this.class_name}& operator=(${this.class_name}&& other);`;
  }

  generate_destructor(): string {
    return `${TAB}${TAB}~${this.class_name}();`;
  }

  create(): string {
    let methods: string[] = [];
    if (this.method_config.default_constructor) {
      methods.push(this.generate_default_constructor());
    }
    if (this.method_config.copy_constructor) {
      methods.push(this.generate_copy_constructor());
    }
    if (this.method_config.move_constructor) {
      methods.push(this.generate_move_constructor());
    }
    if (this.method_config.copy_assignment_operator) {
      methods.push(this.generate_copy_assignment_operator());
    }
    if (this.method_config.move_assignment_operator) {
      methods.push(this.generate_move_assignment_operator());
    }
    if (this.method_config.destructor) {
      methods.push(this.generate_destructor());
    }
    return `${super.create()}

#pragma once

${this.generate_include_lines()}

namespace${0 === this.namespace.length ? "" : " "}${this.namespace}
{
${TAB}class ${this.class_name}
${TAB}{
${TAB}public:
${methods.join(`${os.EOL}${os.EOL}`)}
${TAB}};
}
`;
  }
}

export class CppFileCreator extends SourceFileCreator {
  public using_namespaces: string[];

  constructor(class_name: string) {
    super(class_name);
    this.using_namespaces = [];
  }

  generate_default_constructor(namespace: string): string {
    return `${namespace}${this.class_name}::${this.class_name}()
{
}`;
  }

  generate_copy_constructor(namespace: string): string {
    return `${namespace}${this.class_name}::${this.class_name}(const ${this.class_name}& other)
{
}`;
  }

  generate_move_constructor(namespace: string): string {
    return `${namespace}${this.class_name}::${this.class_name}(${this.class_name}&& other)
{
}`;
  }

  generate_copy_assignment_operator(namespace: string): string {
    return `${namespace}${this.class_name}& ${namespace}${this.class_name}::operator=(const ${this.class_name}& other)
{
}`;
  }

  generate_move_assignment_operator(namespace: string): string {
    return `${namespace}${this.class_name}& ${namespace}${this.class_name}::operator=(${this.class_name}&& other)
{
}`;
  }

  generate_destructor(namespace: string): string {
    return `${namespace}${this.class_name}::~${this.class_name}()
{
}`;
  }

  generate_using_namespace_lines(): string {
    return this.using_namespaces
      .map((ns) => {
        return `using namespace ${ns};`;
      })
      .join(os.EOL);
  }

  create(): string {
    let namespace = "";
    if (0 !== this.namespace.length) {
      namespace = -1 === this.using_namespaces.indexOf(this.namespace) ? `${this.namespace}::` : "";
    }
    let methods: string[] = [];
    if (this.method_config.default_constructor) {
      methods.push(this.generate_default_constructor(namespace));
    }
    if (this.method_config.copy_constructor) {
      methods.push(this.generate_copy_constructor(namespace));
    }
    if (this.method_config.move_constructor) {
      methods.push(this.generate_move_constructor(namespace));
    }
    if (this.method_config.copy_assignment_operator) {
      methods.push(this.generate_copy_assignment_operator(namespace));
    }
    if (this.method_config.move_assignment_operator) {
      methods.push(this.generate_move_assignment_operator(namespace));
    }
    if (this.method_config.destructor) {
      methods.push(this.generate_destructor(namespace));
    }
    return `${super.create()}

${this.generate_include_lines()}

${this.generate_using_namespace_lines()}

${methods.join(`${os.EOL}${os.EOL}`)}
`;
  }
}

export class UiCreator implements TextCreator {
  public class_name: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(className: string) {
    this.class_name = className;
    this.x = 0;
    this.y = 0;
    this.width = 800;
    this.height = 600;
  }

  create(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
    <class>${this.class_name}UI</class>
    <widget class="QDialog" name="${this.class_name}UI">
    <property name="geometry">
    <rect>
    <x>${this.x}</x>
    <y>${this.y}</y>
    <width>${this.width}</width>
    <height>${this.height}</height>
    </rect>
    </property>
    <widget class="GmTitleBar" name="gbmp_title" native="true">
    <property name="geometry">
    <rect>
        <x>0</x>
        <y>0</y>
        <width>720</width>
        <height>24</height>
    </rect>
    </property>
    <property name="minimumSize">
    <size>
        <width>0</width>
        <height>24</height>
    </size>
    </property>
    <property name="font">
    <font>
        <family>微软雅黑</family>
    </font>
    </property>
    <property name="autoFillBackground">
    <bool>false</bool>
    </property>
    </widget>
    </widget>
    <customwidgets>
    <customwidget>
    <class>GmTitleBar</class>
    <extends>QWidget</extends>
    <header>GmtitleBar.h</header>
    <container>1</container>
    </customwidget>
    </customwidgets>
    <resources/>
    <connections/>
</ui>
`;
  }
}

const KEY_HELP = "help";
const KEY_CLASS_NAME = "cls";
const KEY_H = "h";
const KEY_CPP = "cpp";
const KEY_UI = "ui";
const KEY_ALL = "all";
const KEY_DEFAULT_CONSTRUCTOR = "dc";
const KEY_COPY_CONSTRUCTOR = "cc";
const KEY_MOVE_CONSTRUCTOR = "mc";
const KEY_COPY_ASSIGNMENT_OPERATOR = "cao";
const KEY_MOVE_ASSIGNMENT_OPERATOR = "mao";
const KEY_DESTRUCTOR = "dest";
const KEY_NAMESPACE = "ns";

function help() {
  console.log(`用法: create --cls className [options]
创建文件.

选项:
  --help       打印帮助信息
  --cls        [必须] 待创建类的名称
  --h          [可选] 创建头文件 (*.h)
  --cpp        [可选] 创建源文件 (*.cpp)
  --ui         [可选] 创建 Qt 用户交互界面文件 (*.ui)
  --all        [可选] 创建全部三种文件 (*.h, *.cpp, *.ui)
  --dc         [可选] 声明和定义默认构件函数 (Default Constructor, DC)
  --cc         [可选] 声明和定义拷贝构造函数 (Copy Constructor, CC)
  --mc         [可选] 声明和定义移动构造函数 (Move Constructor, MC)
  --cao        [可选] 声明和定义拷贝赋值运算符 (Copy Assignment Operator, CAO)
  --mao        [可选] 声明和定义移动赋值运算符 (Move Assignment Operator, MAO)
  --dest       [可选] 声明和定义析构函数 (DESTructor, DEST)
  --ns         [可选] 在此命名空间下定义类 (NameSpace, NS)

示例:
create --help
create --cls ModelReviewImpl
create --cls ModelReviewSettingDialog --all
create --cls ElementParameterReviewer --dc false
`);
}

function file_has_been_created(filename: string) {
  console.log(`File has been created: ${filename}`);
}

const options: OptionDefinition[] = [
  { name: KEY_HELP, type: Boolean },
  { name: KEY_CLASS_NAME, type: String },
  { name: KEY_H, type: Boolean, defaultValue: true },
  { name: KEY_CPP, type: Boolean, defaultValue: true },
  { name: KEY_UI, type: Boolean, defaultValue: false },
  { name: KEY_ALL, type: Boolean, defaultValue: false },
  { name: KEY_DEFAULT_CONSTRUCTOR, type: Boolean, defaultValue: false },
  { name: KEY_COPY_CONSTRUCTOR, type: Boolean, defaultValue: false },
  { name: KEY_MOVE_CONSTRUCTOR, type: Boolean, defaultValue: false },
  { name: KEY_COPY_ASSIGNMENT_OPERATOR, type: Boolean, defaultValue: false },
  { name: KEY_MOVE_ASSIGNMENT_OPERATOR, type: Boolean, defaultValue: false },
  { name: KEY_DESTRUCTOR, type: Boolean, defaultValue: false },
  { name: KEY_NAMESPACE, type: String, defaultValue: "gap" },
];
const args = commandLineArgs(options, { argv: process.argv });
if (args[KEY_HELP] || !args[KEY_CLASS_NAME]) {
  help();
} else {
  const current_directory = process.cwd();
  const class_name = args[KEY_CLASS_NAME] as string;
  const methods: MethodConfig = {
    default_constructor: args[KEY_DEFAULT_CONSTRUCTOR],
    copy_constructor: args[KEY_COPY_CONSTRUCTOR],
    move_constructor: args[KEY_MOVE_CONSTRUCTOR],
    copy_assignment_operator: args[KEY_COPY_ASSIGNMENT_OPERATOR],
    move_assignment_operator: args[KEY_MOVE_ASSIGNMENT_OPERATOR],
    destructor: args[KEY_DESTRUCTOR],
  };
  if (args[KEY_H] || args[KEY_ALL]) {
    let creator = new HFileCreator(class_name);
    creator.author_info = load_author_info();
    creator.namespace = args[KEY_NAMESPACE];
    if (args[KEY_UI] || args[KEY_ALL]) {
      creator.includes = [create_ui_h_filename(class_name)];
    }
    creator.method_config = methods;
    const content = creator.create();
    const filename = path.join(current_directory, create_h_filename(class_name));
    save_text_to_utf8_with_bom_file(filename, content);
    file_has_been_created(filename);
  }
  if (args[KEY_CPP] || args[KEY_ALL]) {
    let creator = new CppFileCreator(class_name);
    creator.author_info = load_author_info();
    creator.includes = [create_h_filename(class_name)];
    if (args[KEY_UI] || args[KEY_ALL]) {
      creator.includes.push(create_ui_h_filename(class_name));
    }
    creator.includes.push("EnableCompileWarning_The_LAST_IncludeInCpp.h");
    creator.namespace = args[KEY_NAMESPACE];
    creator.using_namespaces = ["gcmp", "gap"];
    creator.method_config = methods;
    const content = creator.create();
    const filename = path.join(current_directory, create_cpp_filename(class_name));
    save_text_to_utf8_with_bom_file(filename, content);
    file_has_been_created(filename);
  }
  if (args[KEY_UI] || args[KEY_ALL]) {
    let creator = new UiCreator(class_name);
    const content = creator.create();
    const filename = path.join(current_directory, create_ui_filename(class_name));
    save_text_to_utf8_file(filename, content);
    file_has_been_created(filename);
  }
}
