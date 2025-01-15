<?php
namespace wolfco\craftthesauruslex\models;

use craft\base\Model;

class Settings extends Model
{
    public $tKey = '';
    public $dKey = '';

    public function defineRules(): array
    {
        return [
            [['tKey', 'dKey'], 'string'],  // Ensure that these are strings (not required by default)
        ];
    }
}
