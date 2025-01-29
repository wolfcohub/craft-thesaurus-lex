<?php
namespace wolfco\craftthesauruslex\models;

use craft\base\Model;

class Settings extends Model
{
    public $tKey = '';
    public $dKey = '';
    public $cacheTTL = 3600;

    public function defineRules(): array
    {
        return [
            [['tKey', 'dKey'], 'string'],  // Ensure that these are strings (not required by default)
            [['cacheTTL'], 'number', 'integerOnly' => true]
        ];
    }
}
