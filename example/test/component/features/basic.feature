Feature: Basic Feature

    Background:
        Given I am an adult user
        And I have opened the Basic website

    Scenario: Happy Path
        Then I should be on the Start page
        When I click continue

        Then I should be on the Your Name page
        Given I enter a name
        When I click continue

        Then I should be on the Your Age page
        Given I enter an age
        When I click continue

        Then I should be on the Favorite Color page
        Given I choose a color
        When I click continue
#
        Then I should be on the Submit page
#        And my name should be correct
#        And my age should be correct
#        And my color should be correct
#        When I click done
#
#        Then I should be on the Done page
#
#    Scenario: Validation
#        Given I am on the Start page
#        When I click continue
#
#        Then I should be on the Your Name page
#        When I click continue
#        Then I should be on the Your Name page
#        And I should have validation errors
#
#        Given I enter a name
#        When I click continue
#
#        Then I should be on the Your Age page
#        When I click continue
#        Then I should be on the Your Age page
#        And I should have validation errors
#
#        Given I enter an age
#        When I click continue
#
#        Then I should be on the Your Favorite Color page
#        When I click continue
#        Then I should be on the Your Favourite Color page
#        And I should have validation errors
#
#        Given I choose a color
#        When I click continue
#        Then I should be on the Submit page
