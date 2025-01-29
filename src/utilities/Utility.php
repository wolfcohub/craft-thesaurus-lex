<?php
namespace wolfco\craftthesauruslex\utilities;
use Craft;
use craft\base\Utility as BaseUtility;

class Utility extends BaseUtility
{
    /**
     * The display name of the utility in the Utilities screen.
     */
    public static function displayName(): string
    {
        return 'Thesaurus Lex';
    }
    /**
     * The unique identifier for this utility.
     */
    public static function id(): string
    {
        return 'thesaurus-lex';
    }
    /**
     * The path to the icon for the utility.
     */
    public static function iconPath(): ?string
    {
        return Craft::getAlias('@plugins/thesaurus-lex/icon.svg'); // Replace with your plugin's icon path
    }
    /**
     * The template that will be rendered when visiting the utility.
     */
    public static function contentHtml(): string
    {
        // Render a template for the Clear Cache button
        return Craft::$app->view->renderTemplate('thesaurus-lex/index');
    }
}
