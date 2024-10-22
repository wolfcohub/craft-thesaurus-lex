<?php
namespace wolfco\thesaurus\assetbundles;

use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;

class CkeditorThesaurusAsset extends BaseCkeditorPackageAsset
{
    public $sourcePath = __DIR__ . '/../resources/build';
    public $depends = [];
    public $js = [
        'thesaurus-lex.js'
    ];
    public $css = [];
    public array $pluginNames = [
        'ThesaurusLex'
    ];
    public array $toolbarItems = [
        'ThesaurusLex'
    ];
}
